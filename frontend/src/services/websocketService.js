import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(userId, onAccessRevoked) {
    if (this.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        this.connected = true;
        console.log('✅ WebSocket connected');
        
        // Subscribe to user-specific notifications
        this.client.subscribe(`/topic/user/${userId}`, (message) => {
          if (message.body === 'ACCESS_REVOKED') {
            console.log('🚫 Access revoked - logging out');
            onAccessRevoked();
          }
        });
        
        // Subscribe to global notifications (database reset)
        this.client.subscribe('/topic/global', (message) => {
          if (message.body === 'DATABASE_RESET') {
            console.log('🔄 Database reset detected - logging out');
            localStorage.clear();
            window.location.href = '/login';
          }
        });
        
        // Subscribe to force logout
        this.client.subscribe('/topic/logout', (message) => {
          if (message.body === 'FORCE_LOGOUT') {
            console.log('🚪 Force logout - redirecting to login');
            localStorage.clear();
            window.location.href = '/login';
          }
        });

        // Handle pending kitchen subscription
        if (this.pendingKitchenSubscription) {
          const { kitchenId, onMemberAdded, onNotificationUpdate } = this.pendingKitchenSubscription;
          this.subscribeToKitchen(kitchenId, onMemberAdded, onNotificationUpdate);
          this.pendingKitchenSubscription = null;
        }
      },
      onDisconnect: () => {
        this.connected = false;
        console.log('❌ WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket STOMP error:', frame);
        this.connected = false;
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.connected = false;
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  subscribeToKitchen(kitchenId, onMemberAdded, onNotificationUpdate) {
    if (!this.client || !this.connected) {
      console.log('WebSocket not connected, queuing kitchen subscription');
      this.pendingKitchenSubscription = { kitchenId, onMemberAdded, onNotificationUpdate };
      return;
    }

    try {
      const subscription = this.client.subscribe(`/topic/kitchen/${kitchenId}`, (message) => {
        if (message.body === 'MEMBER_ADDED' || message.body === 'MEMBER_REMOVED') {
          console.log('🔔 Kitchen member change detected');
          onMemberAdded();
        }
      });
      
      const alertSubscription = this.client.subscribe(`/topic/kitchen/${kitchenId}/alerts`, (message) => {
        const data = JSON.parse(message.body);
        console.log('🔔 Notification update:', data);
        if (onNotificationUpdate) {
          onNotificationUpdate(data.unreadCount);
        }
      });
      
      this.subscriptions.set(`kitchen-${kitchenId}`, subscription);
      this.subscriptions.set(`alerts-${kitchenId}`, alertSubscription);
      console.log(`✅ Subscribed to kitchen ${kitchenId}`);
    } catch (error) {
      console.error('Failed to subscribe to kitchen topic:', error);
    }
  }

  unsubscribeFromKitchen(kitchenId) {
    const subscription = this.subscriptions.get(`kitchen-${kitchenId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`kitchen-${kitchenId}`);
    }
  }
}

export default new WebSocketService();
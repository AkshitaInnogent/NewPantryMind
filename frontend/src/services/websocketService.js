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
        // WebSocket connected
        
        // Skip immediate subscriptions to avoid connection errors

        // Handle pending kitchen subscription
        setTimeout(() => {
          if (this.pendingKitchenSubscription) {
            const { kitchenId, onMemberAdded, onNotificationUpdate } = this.pendingKitchenSubscription;
            this.subscribeToKitchen(kitchenId, onMemberAdded, onNotificationUpdate);
            this.pendingKitchenSubscription = null;
          }
        }, 1000);
      },
      onDisconnect: () => {
        this.connected = false;
        // WebSocket disconnected
      },
      onStompError: (frame) => {
        // WebSocket STOMP error
        this.connected = false;
      },
      onWebSocketError: (error) => {
        // WebSocket connection error
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
      // WebSocket not connected, queuing kitchen subscription
      this.pendingKitchenSubscription = { kitchenId, onMemberAdded, onNotificationUpdate };
      return;
    }

    try {
      const subscription = this.client.subscribe(`/topic/kitchen/${kitchenId}`, (message) => {
        if (message.body === 'MEMBER_ADDED' || message.body === 'MEMBER_REMOVED') {
          // Kitchen member change detected
          onMemberAdded();
        }
      });
      
      const alertSubscription = this.client.subscribe(`/topic/kitchen/${kitchenId}/alerts`, (message) => {
        const data = JSON.parse(message.body);
        // Notification update
        if (onNotificationUpdate) {
          onNotificationUpdate();
        }
      });
      
      this.subscriptions.set(`kitchen-${kitchenId}`, subscription);
      this.subscriptions.set(`alerts-${kitchenId}`, alertSubscription);
      // Subscribed to kitchen
    } catch (error) {
      // Failed to subscribe to kitchen topic
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
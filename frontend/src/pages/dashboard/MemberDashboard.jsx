import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import MemberInventoryStats from "../../components/dashboard/MemberInventoryStats";
import ExpiredItems from "../../components/dashboard/ExpiredItems";
import { Button } from "../../components/ui";
import { RxDashboard } from "react-icons/rx";
import { notificationApi } from "../../services/notificationApi";
import websocketService from "../../services/websocketService";

export default function MemberDashboard() {
  const { user } = useSelector((state) => state.auth || {});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.kitchenId) {
      fetchNotifications();
      
      websocketService.connect(user.userId || user.id || user.email, () => {});
      websocketService.subscribeToKitchen(user.kitchenId, fetchNotifications, fetchNotifications);
      
      return () => {
        markNotificationsAsRead();
      };
    }
  }, [user?.kitchenId]);
  
  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications(user.kitchenId, user.role, user.id);
      setNotifications(response.data);
    } catch (error) {
      // Failed to fetch notifications
    }
  };
  
  const markNotificationsAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(user.kitchenId, user.role, user.id);
      window.dispatchEvent(new CustomEvent('notificationsRead'));
    } catch (error) {
      // Failed to mark notifications as read
    }
  };
  
  const deleteNotification = async (id) => {
    try {
      await notificationApi.deleteNotification(id, user.id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      // Failed to delete notification
    }
  };

  return (
    <PageLayout
      title="Member Dashboard"
      subtitle="View inventory and manage your kitchen items"
      icon={<RxDashboard className="w-6 h-6" />}
    >
      <MemberInventoryStats />
      

      
      {/* Notifications */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Alerts</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const isUnread = !notification.readByUsers?.includes(user?.id);
                return (
                  <div key={notification.id} className={`bg-white p-3 rounded border-l-4 flex justify-between items-start ${
                    notification.severity === 'CRITICAL' ? 'border-red-500' : 
                    notification.severity === 'WARNING' ? 'border-yellow-500' : 'border-blue-500'
                  } ${isUnread ? 'bg-blue-50' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{notification.title}</p>
                        {isUnread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500 text-sm ml-2"
                      title="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No inventory alerts</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import MemberInventoryStats from "../../components/dashboard/MemberInventoryStats";
import { RxDashboard } from "react-icons/rx";
import { notificationApi } from "../../services/notificationApi";

export default function MemberDashboard() {
  const { user } = useSelector((state) => state.auth || {});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.kitchenId) {
      fetchNotifications();
      markNotificationsAsRead();
    }
  }, [user?.kitchenId]);
  
  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications(user.kitchenId, user.role);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  
  const markNotificationsAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(user.kitchenId, user.role);
      window.dispatchEvent(new CustomEvent('notificationsRead'));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
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
              {notifications.map((notification) => (
                <div key={notification.id} className={`bg-white p-3 rounded border-l-4 ${
                  notification.severity === 'CRITICAL' ? 'border-red-500' : 
                  notification.severity === 'WARNING' ? 'border-yellow-500' : 'border-blue-500'
                }`}>
                  <div>
                    <p className="font-medium text-gray-800">{notification.title}</p>
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No inventory alerts</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
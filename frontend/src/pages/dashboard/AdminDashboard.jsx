import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import RightSidebar from "../../components/layout/RightSidebar";
import InventoryStats from "../../components/dashboard/InventoryStats";
import { Button } from "../../components/ui";
import axiosClient from "../../services/api";
import { fetchKitchenMembers } from "../../features/members/memberThunks";
import { notificationApi } from "../../services/notificationApi";
import websocketService from "../../services/websocketService";
import { RxDashboard } from "react-icons/rx";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.kitchenId) {
      dispatch(fetchKitchenMembers(user.kitchenId));
      fetchNotifications();
      
      // Listen for new notifications via WebSocket
      websocketService.subscribeToKitchen(user.kitchenId, () => {
        fetchNotifications();
        dispatch(fetchKitchenMembers(user.kitchenId));
        window.dispatchEvent(new CustomEvent('refreshBadge'));
      }, () => {
        fetchNotifications();
        window.dispatchEvent(new CustomEvent('refreshBadge'));
      });
      
      // Mark notifications as read when leaving dashboard
      return () => {
        markNotificationsAsRead();
      };
    }
  }, [dispatch, user?.kitchenId]);
  
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
      // Trigger header badge update by dispatching custom event
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

  const handleDeleteKitchen = async () => {
    if (window.confirm("Are you sure you want to delete this kitchen? This action cannot be undone and will remove all members and inventory.")) {
      try {
        await axiosClient.delete(`/kitchens/${user.kitchenId}`);
        const updatedUser = { ...user, role: 'USER', kitchenId: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.href = '/user';
      } catch (error) {
        alert('Failed to delete kitchen');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-inter antialiased">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
                <RxDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage your kitchen and monitor inventory</p>
              </div>
            </div>

          </div>

          <InventoryStats />

          {/* Notifications */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const isUnread = !notification.readByUsers?.includes(user?.id);
                    return (
                      <div key={notification.id} className={`bg-white p-3 rounded border-l-4 flex justify-between items-start ${
                        notification.type === 'MEMBER_JOINED' ? 'border-green-500' : 
                        notification.type === 'MEMBER_REMOVED' ? 'border-red-500' :
                        notification.severity === 'CRITICAL' ? 'border-red-500' :
                        notification.severity === 'WARNING' ? 'border-yellow-500' : 'border-blue-500'
                      } ${isUnread ? 'bg-blue-50' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {notification.title && (
                              <p className="font-medium text-gray-800">{notification.title}</p>
                            )}
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
                <p className="text-gray-600">No notifications</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <RightSidebar />
    </div>
  );
}
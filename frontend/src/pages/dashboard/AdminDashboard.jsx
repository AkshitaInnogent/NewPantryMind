import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import RightSidebar from "../../components/layout/RightSidebar";
import InventoryStats from "../../components/dashboard/InventoryStats";
import ExpiredItems from "../../components/dashboard/ExpiredItems";
import { Button } from "../../components/ui";
import axiosClient from "../../services/api";
import { showToast } from "../../utils/toast";
import { showAlert } from "../../utils/sweetAlert";
import { fetchKitchenMembers } from "../../features/members/memberThunks";
import { notificationApi } from "../../services/notificationApi";
import websocketService from "../../services/websocketService";
import { RxDashboard } from "react-icons/rx";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getExpiryAlertSuccess } from '../../services/dashboardApi';
import { FaExclamationTriangle } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const [notifications, setNotifications] = useState([]);
  const [expiryAlertData, setExpiryAlertData] = useState(null);

  useEffect(() => {
    if (user?.kitchenId) {
      dispatch(fetchKitchenMembers(user.kitchenId));
      fetchNotifications();
      fetchExpiryAlertData();
      
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
  
  const fetchExpiryAlertData = async () => {
    try {
      const data = await getExpiryAlertSuccess();
      setExpiryAlertData(data);
    } catch (error) {
      // Use fallback data
      setExpiryAlertData({ itemsWasted: 0, itemsSaved: 0, totalAlerts: 0, successRate: 0 });
    }
  };

  const handleDeleteKitchen = async () => {
    const result = await showAlert.confirm(
      'Delete Kitchen',
      'Are you sure you want to delete this kitchen? This action cannot be undone and will remove all members and inventory.',
      'Yes, delete kitchen'
    );
    
    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/kitchens/${user.kitchenId}`);
        const updatedUser = { ...user, role: 'USER', kitchenId: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast.success('Kitchen deleted successfully');
        window.location.href = '/user';
      } catch (error) {
        showToast.error('Failed to delete kitchen');
      }
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex font-inter antialiased overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Notifications
              </h2>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const isUnread = !notification.readByUsers?.includes(user?.id);
                      return (
                        <div key={notification.id} className={`bg-gray-50 p-4 rounded-lg border-l-4 flex justify-between items-start ${
                          notification.type === 'MEMBER_JOINED' ? 'border-green-500' : 
                          notification.type === 'MEMBER_REMOVED' ? 'border-red-500' :
                          notification.severity === 'CRITICAL' ? 'border-red-500' :
                          notification.severity === 'WARNING' ? 'border-yellow-500' : 'border-blue-500'
                        } ${isUnread ? 'bg-blue-50' : ''}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {notification.title && (
                                <p className="font-semibold text-gray-800">{notification.title}</p>
                              )}
                              {isUnread && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
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
                            className="text-gray-400 hover:text-red-500 text-lg ml-2 font-bold"
                            title="Delete notification"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-600 py-8">
                    <div className="text-4xl mb-2">🔔</div>
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expiry Alert Success Rate */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-500" /> 
                  Alert Success Rate
                </h2>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-700 font-semibold text-sm">Live Data</span>
                </div>
              </div>
              
              {expiryAlertData && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {expiryAlertData.itemsSaved || 0}
                      </div>
                      <div className="text-sm text-green-700">Items Saved</div>
                      <div className="text-xs text-green-600 mt-1">
                        ₹{((expiryAlertData.itemsSaved || 0) * 50)} saved
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {expiryAlertData.itemsWasted || 0}
                      </div>
                      <div className="text-sm text-red-700">Items Wasted</div>
                      <div className="text-xs text-red-600 mt-1">
                        ₹{((expiryAlertData.itemsWasted || 0) * 50)} lost
                      </div>
                    </div>
                  </div>
                  
                  <div style={{height: '200px'}}>
                    <Doughnut 
                      data={{
                        labels: ['Items Saved', 'Items Wasted'],
                        datasets: [{
                          data: [
                            expiryAlertData.itemsSaved || 0,
                            expiryAlertData.itemsWasted || 0
                          ],
                          backgroundColor: ['#16a34a', '#dc2626'],
                          borderWidth: 0,
                          cutout: '70%'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden xl:block flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  );
}
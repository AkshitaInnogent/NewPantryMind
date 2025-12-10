import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, fetchUnreadCount, markAllAsRead, deleteNotification } from '../../features/notifications/notificationSlice';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);
  const { currentKitchen } = useSelector(state => state.kitchen);

  useEffect(() => {
    if ((user?.role === 'ADMIN' || user?.role === 'MEMBER') && currentKitchen?.id) {
      dispatch(fetchUnreadCount());
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [dispatch, user, currentKitchen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      dispatch(fetchNotifications());
      dispatch(markAllAsRead());
    }
    setIsOpen(!isOpen);
  };

  const handleDelete = (id) => {
    if (user?.role === 'MEMBER') {
      dispatch(deleteNotification({ id, isMember: true }));
    } else {
      dispatch(deleteNotification(id));
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if ((user?.role !== 'ADMIN' && user?.role !== 'MEMBER') || !currentKitchen?.id) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                    </div>
                    {console.log('Rendering delete button for user role:', user?.role)}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      title={`Delete (Role: ${user?.role})`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
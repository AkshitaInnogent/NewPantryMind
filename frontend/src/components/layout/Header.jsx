import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import { FaRegBell } from "react-icons/fa";
import { useState, useEffect } from "react";
import { notificationApi } from "../../services/notificationApi";
import websocketService from "../../services/websocketService";


export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user?.kitchenId && (user?.role === "ADMIN" || user?.role === "MEMBER")) {
      fetchUnreadCount();
      websocketService.subscribeToKitchen(user.kitchenId, () => {}, setUnreadCount);
      
      const handleNotificationsRead = () => setUnreadCount(0);
      window.addEventListener('notificationsRead', handleNotificationsRead);
      
      return () => {
        window.removeEventListener('notificationsRead', handleNotificationsRead);
      };
    }
  }, [user?.kitchenId, user?.role]);
  

  
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount(user.kitchenId, user.role);
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src="/image/logo.png" 
              alt="PantryMind" 
              className="h-32"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <h1 className="text-xl font-bold text-green-600" style={{display: 'none'}}>PantryMind</h1>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm">
                  <span className="text-gray-600">Welcome, </span>
                  <span className="font-medium text-gray-900">{user?.name || user?.email}</span>
                  {user?.role && (
                    <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full ${
                      user.role === "ADMIN" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-green-50 text-green-600"
                    }`}>
                      {user.role}
                    </span>
                  )}
                </div>
                
                {(user?.role === "ADMIN" || user?.role === "MEMBER") && (
                  <button
                    onClick={async () => {
                      navigate("/dashboard");
                      if (unreadCount > 0) {
                        try {
                          await notificationApi.markAllAsRead(user.kitchenId, user.role);
                          setUnreadCount(0);
                        } catch (error) {
                          console.error('Failed to mark notifications as read:', error);
                        }
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-green-600 transition-colors duration-200 relative"
                    title="Go to Dashboard"
                  >
                    <FaRegBell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-green-600 hover:text-green-700 px-4 py-2 text-sm font-semibold transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
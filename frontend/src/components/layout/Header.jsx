import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src="/image/logo.png" 
              alt="PantryMind" 
              className="h-24"
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
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      user.role === "ADMIN" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {user.role}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RoleBasedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user has no role, redirect to kitchen setup
  if (!user.role) {
    return <Navigate to="/kitchen-setup" replace />;
  }
  
  // If specific roles are required, check if user has allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (user.role === "MEMBER") {
      return <Navigate to="/member" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }
  
  return children;
}
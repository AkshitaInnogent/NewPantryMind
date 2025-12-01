import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RoleBasedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user has no role or role is "USER", redirect to kitchen setup
  if (!user.role || user.role === "USER") {
    return <Navigate to="/kitchen-setup" replace />;
  }
  
  // If specific roles are required, check if user has allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}
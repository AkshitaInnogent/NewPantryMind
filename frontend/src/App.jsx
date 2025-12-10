import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { initializeAuth, logout } from './features/auth/authSlice';
import { validateUser } from './features/auth/authThunks';
import websocketService from './services/websocketService';
import './App.css'
import LandingPage from './pages/LandingPage'
import { Login, Register, ForgotPassword, ResetPassword } from './pages/auth'
import KitchenSetup from './pages/kitchen/KitchenSetup'
import { AdminDashboard, MemberDashboard, UserDashboard } from './pages/dashboard'
import { ProtectedRoute, RoleBasedRoute } from './guards'
import Header from './components/layout/Header'
import InventoryList from './pages/inventory/InventoryList'
import InventoryDetails from './pages/inventory/InventoryDetails'
import AddInventoryItem from './pages/inventory/AddInventoryItem'
import AddInventoryOCR from './pages/inventory/AddInventoryOCR'
import EditInventoryItem from './pages/inventory/EditInventoryItem'
import MemberList from './pages/members/MemberList'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'
import Profile from './pages/profile/Profile'
import LowStockAlerts from './pages/alerts/LowStockAlerts'
import ExpiryAlerts from './pages/alerts/ExpiryAlerts'
import SmartRecipes from './pages/recipes/SmartRecipes'
import RecipeDetail from './pages/recipes/RecipeDetail'
import ShoppingList from './pages/shopping/ShoppingList'
import AuthDebug from './components/AuthDebug'
import Logout from './pages/Logout'

// Component to redirect based on role
function DashboardRedirect() {
  const { user } = useSelector((state) => state.auth || {});
  
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === "MEMBER") {
    return <Navigate to="/member" replace />;
  } else {
    return <Navigate to="/user" replace />;
  }
}

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize app and check authentication state
    const initializeApp = async () => {
      dispatch(initializeAuth());
      
      // If user appears to be authenticated, validate with server
      if (isAuthenticated) {
        try {
          await dispatch(validateUser()).unwrap();
        } catch (error) {
          // If validation fails (server restart), keep user logged in with stored data
          console.log('Server validation failed, using stored user data');
        }
      }
      
      setIsInitialized(true);
    };
    
    initializeApp();
  }, [dispatch, isAuthenticated]);
  
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    // Connect to WebSocket for real-time notifications
    const handleAccessRevoked = () => {
      // Update user role to USER and remove kitchen without logging out
      const updatedUser = { ...user, role: 'USER', kitchenId: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.href = '/user';
    };
    
    websocketService.connect(user.id, handleAccessRevoked);
    
    return () => {
      websocketService.disconnect();
    };
  }, [dispatch, isAuthenticated, user?.id]);
  
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <Header />
      {/* <AuthDebug /> */}
      <Routes>
        <Route path="/" element={isAuthenticated ? <DashboardRedirect /> : <LandingPage />} />
        <Route path="/register" element={isAuthenticated ? <DashboardRedirect /> : <Register />} />
        <Route path="/login" element={isAuthenticated ? <DashboardRedirect /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* User Dashboard for USER role */}
        <Route path="/user" element={
          <RoleBasedRoute allowedRoles={["USER"]}>
            <UserDashboard />
          </RoleBasedRoute>
        } />
        
        {/* Kitchen setup for users with no role or USER role */}
        <Route path="/kitchen-setup" element={
          <ProtectedRoute>
            <KitchenSetup />
          </ProtectedRoute>
        } />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <RoleBasedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RoleBasedRoute>
        } />
        
        {/* Member Dashboard */}
        <Route path="/member" element={
          <RoleBasedRoute allowedRoles={["MEMBER"]}>
            <MemberDashboard />
          </RoleBasedRoute>
        } />
        
        {/* Inventory Routes */}
        <Route path="/inventory" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <InventoryList />
          </RoleBasedRoute>
        } />
        <Route path="/inventory/add" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <AddInventoryItem />
          </RoleBasedRoute>
        } />
        <Route path="/inventory/add-ocr" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <AddInventoryOCR />
          </RoleBasedRoute>
        } />
        <Route path="/inventory/details/:id" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <InventoryDetails />
          </RoleBasedRoute>
        } />
        <Route path="/inventory/edit/:id" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <EditInventoryItem />
          </RoleBasedRoute>
        } />
        
        {/* Member Management Routes - ADMIN only */}
        <Route path="/members" element={
          <RoleBasedRoute allowedRoles={["ADMIN"]}>
            <MemberList />
          </RoleBasedRoute>
        } />
        
        {/* Reports Route */}
        <Route path="/reports" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <Reports />
          </RoleBasedRoute>
        } />
        
        {/* Settings Route */}
        <Route path="/settings" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <Settings />
          </RoleBasedRoute>
        } />
        
        {/* Alert Routes */}
        <Route path="/alerts/low-stock" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <LowStockAlerts />
          </RoleBasedRoute>
        } />
        <Route path="/alerts/expiry" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <ExpiryAlerts />
          </RoleBasedRoute>
        } />
        
        {/* Profile Route */}
        <Route path="/profile" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER", "USER"]}>
            <Profile />
          </RoleBasedRoute>
        } />
        
        {/* Smart Recipes Routes */}
        <Route path="/recipes" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <SmartRecipes />
          </RoleBasedRoute>
        } />
        
        <Route path="/recipe-detail" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <RecipeDetail />
          </RoleBasedRoute>
        } />
        
        {/* Shopping List Route */}
        <Route path="/shopping" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <ShoppingList />
          </RoleBasedRoute>
        } />
        
        {/* Logout Route */}
        <Route path="/logout" element={<Logout />} />
        
        {/* Generic dashboard redirect */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
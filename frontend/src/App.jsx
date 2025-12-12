import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, Suspense, lazy } from "react";
import { initializeAuth } from './features/auth/authSlice';
import { validateUser } from './features/auth/authThunks';
import websocketService from './services/websocketService';
import './App.css'
import { ProtectedRoute, RoleBasedRoute } from './guards'
import Header from './components/layout/Header'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Immediate load components (auth & landing)
import LandingPage from './pages/LandingPage'
import { Login, Register, ForgotPassword, ResetPassword, VerifyOtp } from './pages/auth'
import Logout from './pages/Logout'

// Lazy load heavy components
const KitchenSetup = lazy(() => import('./pages/kitchen/KitchenSetup'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const MemberDashboard = lazy(() => import('./pages/dashboard/MemberDashboard'));
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const InventoryList = lazy(() => import('./pages/inventory/InventoryList'));
const InventoryDetails = lazy(() => import('./pages/inventory/InventoryDetails'));
// const AddInventoryItem = lazy(() => import('./pages/inventory/AddInventoryItem'));
const AddInventoryOCR = lazy(() => import('./pages/inventory/AddInventoryOCR'));
const EditInventoryItem = lazy(() => import('./pages/inventory/EditInventoryItem'));
const MemberList = lazy(() => import('./pages/members/MemberList'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const LowStockAlerts = lazy(() => import('./pages/alerts/LowStockAlerts'));
const ExpiryAlerts = lazy(() => import('./pages/alerts/ExpiryAlerts'));
const ExpiredProducts = lazy(() => import('./pages/alerts/ExpiredProducts'));
const SmartRecipes = lazy(() => import('./pages/recipes/SmartRecipes'));
const RecipeDetail = lazy(() => import('./pages/recipes/RecipeDetail'));
const ExpiryRecipes = lazy(() => import('./pages/recipes/ExpiryRecipes'));
const QuickRecipes = lazy(() => import('./pages/recipes/QuickRecipes'));
const SpecificRecipes = lazy(() => import('./pages/recipes/SpecificRecipes'));
const RecipePreferences = lazy(() => import('./pages/preferences/RecipePreferences'));
const ShoppingList = lazy(() => import('./pages/shopping/ShoppingList'));

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
      
      // Check if we have a token to validate
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await dispatch(validateUser()).unwrap();
        } catch (error) {
          // Server validation failed, using stored user data
        }
      }
      
      setIsInitialized(true);
    };
    
    initializeApp();
  }, [dispatch]);
  
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
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '16px'
        }}>
          Loading...
        </div>
      }>
        <Routes>
        <Route path="/" element={isAuthenticated ? <DashboardRedirect /> : <LandingPage />} />
        <Route path="/register" element={isAuthenticated ? <DashboardRedirect /> : <Register />} />
        <Route path="/login" element={isAuthenticated ? <DashboardRedirect /> : <Login />} />
        <Route path="/verify-otp" element={isAuthenticated ? <DashboardRedirect /> : <VerifyOtp />} />
        <Route path="/forgot-password" element={isAuthenticated ? <DashboardRedirect /> : <ForgotPassword />} />
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
        <Route path="/inventory/edit-item/:id" element={
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
        
        <Route path="/recipes/expiry" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <ExpiryRecipes />
          </RoleBasedRoute>
        } />
        
        <Route path="/recipes/quick" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <QuickRecipes />
          </RoleBasedRoute>
        } />
        
        <Route path="/recipes/specific" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <SpecificRecipes />
          </RoleBasedRoute>
        } />
        
        {/* Shortcut route for expiry */}
        <Route path="/expiry" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <ExpiryAlerts />
          </RoleBasedRoute>
        } />
        
        {/* Expired products route */}
        <Route path="/expired-products" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <ExpiredProducts />
          </RoleBasedRoute>
        } />
        
        <Route path="/preferences/recipe" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <RecipePreferences />
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
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  )
}

export default App

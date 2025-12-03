import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import './App.css'
import LandingPage from './pages/LandingPage'
import { Login, Register, ForgotPassword, ResetPassword } from './pages/auth'
import KitchenSetup from './pages/kitchen/KitchenSetup'
import { AdminDashboard, MemberDashboard } from './pages/dashboard'
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
import SmartRecipes from './pages/recipes/SmartRecipes'
import ShoppingList from './pages/shopping/ShoppingList'
import AuthDebug from './components/AuthDebug'

// Component to redirect based on role
function DashboardRedirect() {
  const { user } = useSelector((state) => state.auth || {});
  
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === "MEMBER") {
    return <Navigate to="/member" replace />;
  } else {
    return <Navigate to="/kitchen-setup" replace />;
  }
}

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth || {});
  
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
        
        {/* Profile Route */}
        <Route path="/profile" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <Profile />
          </RoleBasedRoute>
        } />
        
        {/* Smart Recipes Route */}
        <Route path="/recipes" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <SmartRecipes />
          </RoleBasedRoute>
        } />
        
        {/* Shopping List Route */}
        <Route path="/shopping" element={
          <RoleBasedRoute allowedRoles={["ADMIN", "MEMBER"]}>
            <ShoppingList />
          </RoleBasedRoute>
        } />
        
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
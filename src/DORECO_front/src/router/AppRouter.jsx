import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@config/context/auth-context"
import Skeleton from "react-loading-skeleton"

import Login from "@auth/Login"
import Register from "@auth/Register"
import ForgetPassword from "@auth/ForgetPassword"
import ResetPassword from "@auth/ResetPassword"

import MainLayout from "@/components/layout/MainLayout"
import Dashboard from "@/pages/Dashboard"
import ObjectsList from "@/pages/objects/ObjectsList"
import ObjectDetails from "@/pages/objects/ObjectDetails"
import PublicObjectDetails from "@/pages/objects/PublicObjectDetails"
import PublishObject from "@/pages/objects/PublishObject"
import Categories from "@/pages/admin/Categories"
import Reports from "@/pages/admin/Reports"
import ReportView from "@/pages/admin/ReportView"
import Profile from "@/pages/Profile"
import MyInterests from "@/pages/MyInterests"

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-4">
      <Skeleton height={40} width={200} />
      <Skeleton height={20} width={300} />
      <div className="space-y-2">
        <Skeleton height={60} width={400} />
        <Skeleton height={60} width={400} />
      </div>
    </div>
  </div>
)

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) {
    return <LoadingScreen />
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (adminOnly && user?.role_name !== "ADMIN") {
    return <Navigate to="/dashboard" replace />
  }
  return <MainLayout>{children}</MainLayout>
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) {
    return <LoadingScreen />
  }
  if (!isAuthenticated) return children;
  if (user?.role_name === "ADMIN") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/objects" replace />;
}

const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgetpassword"
        element={
          <PublicRoute>
            <ForgetPassword/>
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword/>
          </PublicRoute>
        }
      />
      <Route 
        path="/objects/public/:uuid" 
        element={<PublicObjectDetails/>
        } 
      />


      <Route
        path="/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/objects"
        element={
          <ProtectedRoute>
            <ObjectsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/objects/:id"
        element={
          <ProtectedRoute>
            <ObjectDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/publish"
        element={
          <ProtectedRoute>
            <PublishObject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute adminOnly>
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute adminOnly>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports/:id"
        element={
          <ProtectedRoute adminOnly>
            <ReportView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-interests"
        element={
          <ProtectedRoute>
            <MyInterests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <RoleRedirect />
        }
      />

      <Route
        path="*"
        element={
          <RoleRedirect />
        }
      />
    </Routes>
  )
}

const RoleRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role_name === "ADMIN") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/objects" replace />;
};

export default AppRouter

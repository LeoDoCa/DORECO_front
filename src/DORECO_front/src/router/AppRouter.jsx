"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@config/context/auth-context"
import Skeleton from "react-loading-skeleton"

import Login from "@auth/Login"
import Register from "@auth/Register"


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

  return children;

}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return children;
  }

  return <Navigate to="/dashboard" replace />;

}

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
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
    </Routes>
  )
}

export default AppRouter

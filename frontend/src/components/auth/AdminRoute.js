import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminRoute = () => {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth)

  // Redux Persist is still rehydrating — wait before deciding
  // token exists but isAuthenticated not yet set = rehydrating
  if (token && !isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in → admin login page
  if (!isAuthenticated || !token) {
    return <Navigate to="/admin/login" replace />
  }

  // Logged in but not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export default AdminRoute

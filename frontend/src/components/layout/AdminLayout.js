import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiPercent, FiBarChart2, FiLogOut, FiMenu, FiX, FiHome,
  FiBell, FiChevronRight, FiSettings, FiImage
} from 'react-icons/fi'
import { logoutUser } from '../../store/slices/authSlice'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FiGrid, exact: true, color: 'text-violet-600', bg: 'bg-violet-50' },
  { path: '/admin/products', label: 'Products', icon: FiPackage, color: 'text-blue-600', bg: 'bg-blue-50' },
  { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
  { path: '/admin/users', label: 'Users', icon: FiUsers, color: 'text-green-600', bg: 'bg-green-50' },
  { path: '/admin/categories', label: 'Categories', icon: FiTag, color: 'text-pink-600', bg: 'bg-pink-50' },
  { path: '/admin/banners', label: 'Hero Banners', icon: FiImage, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { path: '/admin/coupons', label: 'Coupons', icon: FiPercent, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { path: '/admin/inventory', label: 'Inventory', icon: FiBarChart2, color: 'text-red-600', bg: 'bg-red-50' },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings, color: 'text-gray-600', bg: 'bg-gray-50' }
]

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/admin/login')
  }

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const currentPage = navItems.find(item => isActive(item))?.label || 'Admin'

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md shadow-yellow-200">
            <span className="text-white font-bold text-sm">KE</span>
          </div>
          <div>
            <p className="text-gray-800 font-bold text-sm leading-tight">Kurti Elegance</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all">
          <FiX size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                active ? 'bg-yellow-100' : `${item.bg} opacity-70 group-hover:opacity-100`
              }`}>
                <item.icon size={16} className={active ? 'text-yellow-600' : item.color} />
              </div>
              <span className="flex-1">{item.label}</span>
              {active && <FiChevronRight size={14} className="text-yellow-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link to="/" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <FiHome size={15} className="text-gray-500" />
          </div>
          View Store
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <FiLogOut size={15} className="text-red-500" />
          </div>
          Logout
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-3 mt-1 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
          <img
            src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=D4AF37&color=fff&size=64`}
            alt={user?.name}
            className="w-9 h-9 rounded-full border-2 border-yellow-300 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-gray-800 text-xs font-bold truncate">{user?.name}</p>
            <p className="text-yellow-600 text-xs font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 fixed top-0 left-0 bottom-0 z-40 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 py-3.5 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-all">
            <FiMenu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 hidden sm:block">Admin</span>
            <span className="text-gray-300 hidden sm:block">/</span>
            <span className="text-gray-700 font-semibold">{currentPage}</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
              <FiBell size={18} />
            </button>
            <Link to="/admin/settings" className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
              <FiSettings size={18} />
            </Link>
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100 ml-1">
              <img
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=D4AF37&color=fff&size=64`}
                alt={user?.name}
                className="w-8 h-8 rounded-full border-2 border-yellow-300"
              />
              <div className="hidden sm:block">
                <p className="text-gray-700 text-sm font-semibold leading-tight">{user?.name}</p>
                <p className="text-yellow-600 text-xs">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-gray-100 bg-white">
          <p className="text-gray-400 text-xs text-center">© 2026 Kurti Elegance Admin Panel · All rights reserved</p>
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout

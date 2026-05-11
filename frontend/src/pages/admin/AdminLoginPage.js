import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle, FiArrowRight } from 'react-icons/fi'
import { loginUser } from '../../store/slices/authSlice'

const AdminLoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true })
    } else if (isAuthenticated && user?.role !== 'admin') {
      setLocalError('Access denied. This portal is for administrators only.')
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    const result = await dispatch(loginUser(form))
    if (result.error) {
      setLocalError(result.payload || 'Invalid credentials')
      return
    }
    const loggedUser = result.payload?.user
    if (loggedUser?.role !== 'admin') {
      setLocalError('Access denied. You do not have admin privileges.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-yellow-500 font-black text-2xl">KE</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 leading-tight">
            Kurti Elegance<br />Admin Panel
          </h1>
          <p className="text-yellow-100 text-base leading-relaxed max-w-xs mx-auto">
            Manage your kurti store — products, orders, customers and analytics all in one place.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3 text-left">
            {[
              'Real-time sales analytics',
              'Order & inventory management',
              'Customer management',
              'Coupon & discount control',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-white/90 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">KE</span>
            </div>
            <div>
              <p className="text-gray-800 font-bold text-sm">Kurti Elegance</p>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <FiShield size={12} />
              ADMINISTRATOR ACCESS
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome back</h2>
            <p className="text-gray-400 text-sm">Sign in to your admin account to continue</p>
          </div>

          {/* Error */}
          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5"
            >
              <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-red-600 text-sm font-medium">{localError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-gray-600 text-sm font-semibold mb-2 block">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="email"
                  placeholder="admin@kurtiegance.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all text-sm shadow-sm"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-600 text-sm font-semibold mb-2 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-12 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all text-sm shadow-sm"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-yellow-200 flex items-center justify-center gap-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Admin Panel
                  <FiArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-blue-700 text-xs font-semibold mb-1.5">Default Admin Credentials</p>
            <div className="space-y-1">
              <p className="text-blue-600 text-xs font-mono">Email: admin@kurtiegance.com</p>
              <p className="text-blue-600 text-xs font-mono">Password: Admin@2026</p>
            </div>
          </div>

          {/* Back to store */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Not an admin?{' '}
            <a href="/" className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors">
              Go to Store →
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminLoginPage

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { loginUser } from '../store/slices/authSlice'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(form))
    if (!result.error) navigate(from, { replace: true })
  }

  return (
    <>
      <Helmet><title>Login - Kurti Elegance</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-gradient-gold mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" placeholder="Email address" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-luxury pl-12" required />
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-luxury pl-12 pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-yellow-600 text-sm hover:text-yellow-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-gray-400 text-sm">or</span>
              </div>
            </div>
            <p className="text-center text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-semibold">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default LoginPage

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiX, FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi'
import { closeAuthModal, setAuthModalMode } from '../../store/slices/uiSlice'
import { loginUser, registerUser } from '../../store/slices/authSlice'

const AuthModal = () => {
  const dispatch = useDispatch()
  const { authModalMode } = useSelector((state) => state.ui)
  const { loading } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(loginForm))
    if (!result.error) dispatch(closeAuthModal())
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const result = await dispatch(registerUser(registerForm))
    if (!result.error) dispatch(closeAuthModal())
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => dispatch(closeAuthModal())}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 28 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
        >
          <FiX size={20} />
        </button>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8">
          {['login', 'register'].map((mode) => (
            <button
              key={mode}
              onClick={() => dispatch(setAuthModalMode(mode))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                authModalMode === mode
                  ? 'bg-white text-yellow-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {authModalMode === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="font-display text-3xl font-bold text-gradient-gold">Welcome Back</h2>
                <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
              </div>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="input-luxury pl-11"
                  required
                />
              </div>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="input-luxury pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => dispatch(setAuthModalMode('register'))}
                  className="text-yellow-600 hover:text-yellow-700 font-semibold"
                >
                  Create one
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="font-display text-3xl font-bold text-gradient-gold">Join Us</h2>
                <p className="text-gray-400 text-sm mt-1">Create your account</p>
              </div>

              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="input-luxury pl-11"
                  required
                />
              </div>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="input-luxury pl-11"
                  required
                />
              </div>

              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="input-luxury pl-11"
                />
              </div>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="input-luxury pl-11 pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => dispatch(setAuthModalMode('login'))}
                  className="text-yellow-600 hover:text-yellow-700 font-semibold"
                >
                  Sign in
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default AuthModal

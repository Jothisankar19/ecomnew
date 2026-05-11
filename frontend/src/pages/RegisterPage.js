import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi'
import { registerUser } from '../store/slices/authSlice'

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(registerUser(form))
    if (!result.error) navigate('/verify-email', { state: { email: form.email } })
  }

  return (
    <>
      <Helmet><title>Create Account - Kurti Elegance</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-gradient-gold mb-2">Join Us</h1>
            <p className="text-gray-500">Create your Kurti Elegance account</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-luxury pl-12" required />
              </div>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" placeholder="Email address" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-luxury pl-12" required />
              </div>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="tel" placeholder="Phone Number (optional)" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-luxury pl-12" />
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 characters)"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-luxury pl-12 pr-12" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default RegisterPage

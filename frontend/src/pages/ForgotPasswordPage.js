import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi'
import api from '../utils/api'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet><title>Forgot Password - Kurti Elegance</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-colors text-sm">
            <FiArrowLeft size={16} /> Back to Login
          </Link>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            {sent ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="text-green-500" size={28} />
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                <p className="text-gray-500 text-sm mb-6">
                  We've sent a reset link to <strong className="text-gray-700">{email}</strong>
                </p>
                <button onClick={() => setSent(false)} className="btn-secondary text-sm">Try Again</button>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">Forgot Password?</h1>
                  <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="email" placeholder="Email address" value={email}
                      onChange={(e) => setEmail(e.target.value)} className="input-luxury pl-12" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default ForgotPasswordPage

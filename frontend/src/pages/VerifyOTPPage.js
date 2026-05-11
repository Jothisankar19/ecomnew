import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiMail, FiArrowLeft, FiRefreshCw, FiCheck } from 'react-icons/fi'
import { verifyOTP, resendOTP } from '../store/slices/authSlice'

const VerifyOTPPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, isAuthenticated, pendingEmail } = useSelector((state) => state.auth)

  const email = location.state?.email || pendingEmail || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  // Redirect if already verified
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // digits only
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    // Auto-focus next
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) return
    await dispatch(verifyOTP({ email, otp: otpString }))
  }

  const handleResend = async () => {
    if (!canResend) return
    setCanResend(false)
    setResendTimer(60)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
    await dispatch(resendOTP(email))
  }

  const otpComplete = otp.every(d => d !== '')

  return (
    <>
      <Helmet><title>Verify Email — Kurti Elegance</title></Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Back */}
          <button onClick={() => navigate('/register')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
            <FiArrowLeft size={16} /> Back to Register
          </button>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            {/* Icon */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center mx-auto mb-4"
              >
                <FiMail className="text-yellow-500" size={28} />
              </motion.div>
              <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">Check your email</h1>
              <p className="text-gray-400 text-sm">
                We sent a 6-digit OTP to
              </p>
              <p className="text-yellow-600 font-semibold text-sm mt-1">{email}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Input boxes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                        digit
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-yellow-400 focus:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify button */}
              <motion.button
                type="submit"
                disabled={loading || !otpComplete}
                whileHover={{ scale: otpComplete && !loading ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm ${
                  otpComplete
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-lg shadow-yellow-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying...</>
                ) : (
                  <><FiCheck size={16} />Verify & Open Account</>
                )}
              </motion.button>
            </form>

            {/* Resend */}
            <div className="text-center mt-5">
              {canResend ? (
                <button onClick={handleResend}
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold text-sm mx-auto transition-colors">
                  <FiRefreshCw size={14} /> Resend OTP
                </button>
              ) : (
                <p className="text-gray-400 text-sm">
                  Resend OTP in <span className="text-yellow-600 font-semibold">{resendTimer}s</span>
                </p>
              )}
            </div>

            {/* Help text */}
            <p className="text-center text-gray-400 text-xs mt-4">
              Didn't receive it? Check your spam folder.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default VerifyOTPPage

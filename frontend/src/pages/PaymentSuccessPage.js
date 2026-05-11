import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi'

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    const fireConfetti = async () => {
      try {
        const confetti = (await import('canvas-confetti')).default
        const duration = 3000
        const end = Date.now() + duration
        const colors = ['#D4AF37', '#FFD700', '#FFA500', '#FF69B4']
        const frame = () => {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
      } catch {}
    }
    fireConfetti()
  }, [])

  return (
    <>
      <Helmet><title>Order Placed Successfully - Kurti Elegance</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.7 }} className="text-center max-w-md mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FiCheck size={44} className="text-green-500" strokeWidth={3} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">Order Placed!</h1>
            <p className="text-gray-500 mb-6">
              Your order has been placed successfully. We'll send you a confirmation email shortly.
            </p>
            {orderId && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left">
                <p className="text-gray-400 text-xs mb-1">Order ID</p>
                <p className="text-yellow-600 font-bold text-lg">{orderId}</p>
                {paymentId && (
                  <>
                    <p className="text-gray-400 text-xs mt-3 mb-1">Payment ID</p>
                    <p className="text-gray-600 text-sm font-medium">{paymentId}</p>
                  </>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link to="/orders" className="btn-primary flex items-center justify-center gap-2 py-4">
                <FiPackage size={18} /> Track Your Order
              </Link>
              <Link to="/products" className="btn-secondary flex items-center justify-center gap-2 py-3">
                Continue Shopping <FiArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default PaymentSuccessPage

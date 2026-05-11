import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiTrendingUp, FiShoppingBag } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { hideTrendingBanner } from '../../store/slices/uiSlice'
import api from '../../utils/api'

const defaultBanners = [
  { userName: 'Priya', city: 'Chennai', productName: 'Floral Anarkali Kurti', action: 'just purchased' },
  { userName: 'Meera', city: 'Mumbai', productName: 'Designer Silk Saree', action: 'ordered' },
  { userName: 'Ananya', city: 'Bangalore', productName: 'Cotton Printed Kurti Set', action: 'just bought' },
  { userName: 'Kavya', city: 'Hyderabad', productName: 'Festival Lehenga', action: 'purchased' },
  { userName: 'Divya', city: 'Delhi', productName: 'Embroidered Kurti', action: 'just ordered' },
]

const TrendingBanner = () => {
  const dispatch = useDispatch()
  const { trendingBannerVisible } = useSelector((state) => state.ui)
  const [banners, setBanners] = useState(defaultBanners)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState(null)

  useEffect(() => {
    // Fetch once on mount — don't poll repeatedly
    const fetchTrending = async () => {
      try {
        const { data } = await api.get('/admin/trending-orders')
        if (data.banners?.length > 0) setBanners(data.banners)
      } catch {
        // Silently use default banners if API fails
      }
    }
    fetchTrending()
  }, []) // empty deps = runs once only

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [banners.length])

  useEffect(() => {
    const showNext = () => {
      const banner = banners[Math.floor(Math.random() * banners.length)]
      setPopupData(banner)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 4000)
    }
    const interval = setInterval(showNext, 8000)
    const timer = setTimeout(showNext, 3000)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [banners])

  if (!trendingBannerVisible) return null

  const current = banners[currentIndex]

  return (
    <>
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 relative z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <FiTrendingUp className="text-white flex-shrink-0" size={14} />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-xs text-white font-medium truncate"
              >
                🔥 <strong>{current.userName}</strong> from {current.city} {current.action}{' '}
                <strong>{current.productName}</strong>
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-white/90 mx-4 font-medium">
            <span>✨ Free shipping above ₹999</span>
            <span>🎁 Easy returns</span>
            <span>💳 Secure payments</span>
          </div>
          <button
            onClick={() => dispatch(hideTrendingBanner())}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close banner"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Floating Popup */}
      <AnimatePresence>
        {showPopup && popupData && (
          <motion.div
            initial={{ opacity: 0, x: -80, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="fixed bottom-6 left-4 z-50 max-w-xs"
          >
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-sm">
                  {popupData.userName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 leading-tight">
                  <strong>{popupData.userName}</strong> from {popupData.city}
                </p>
                <p className="text-xs text-yellow-600 font-semibold truncate">
                  {popupData.action} {popupData.productName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Just now</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default TrendingBanner

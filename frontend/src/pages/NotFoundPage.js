import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiArrowLeft, FiHome } from 'react-icons/fi'

const NotFoundPage = () => (
  <>
    <Helmet><title>404 - Page Not Found - Kurti Elegance</title></Helmet>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
        <motion.h1
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="font-display text-[9rem] font-bold leading-none text-gray-100 select-none"
        >
          404
        </motion.h1>
        <div className="-mt-12 relative z-10">
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Oops! The page you're looking for seems to have wandered off. Let's get you back to the kurtis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary flex items-center justify-center gap-2 py-3.5 px-8">
              <FiHome size={18} /> Go Home
            </Link>
            <button onClick={() => window.history.back()}
              className="btn-secondary flex items-center justify-center gap-2 py-3.5 px-8">
              <FiArrowLeft size={18} /> Go Back
            </button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {['Anarkali Kurtis', 'Printed Kurtis', 'Party Wear', 'Office Kurtis'].map((cat) => (
              <Link key={cat} to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-500 hover:text-yellow-600 hover:border-yellow-300 transition-all shadow-sm">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </>
)

export default NotFoundPage

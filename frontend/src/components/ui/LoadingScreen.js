import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + Math.random() * 15 : prev));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center max-w-xs w-full px-6"
      >
        {/* Animated Logo Mark */}
        <div className="relative mb-10">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-2xl shadow-yellow-200 relative z-10"
          >
            <span className="text-white font-display text-3xl font-black italic">KE</span>
          </motion.div>
          {/* Pulse Effect */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-yellow-400/30 -z-0"
          />
        </div>

        {/* Brand Name */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-2xl font-black text-gray-900 tracking-tighter uppercase mb-1"
          >
            Kurti <span className="text-yellow-600 font-light italic">Elegance</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            Premium Ethnic Wear
          </motion.p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden relative mb-4">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400"
            animate={{ 
              width: `${progress}%`,
              x: ["0%", "5%", "0%"]
            }}
            transition={{ width: { duration: 0.5 }, x: { duration: 2, repeat: Infinity } }}
          />
        </div>
        
        <div className="flex justify-between w-full px-1">
          <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Loading</span>
          <span className="text-yellow-600 text-[9px] font-black uppercase tracking-widest">{Math.round(progress)}%</span>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-yellow-50/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square rounded-full bg-yellow-50/50 blur-[120px]" />
      </div>
    </div>
  )
}

export default LoadingScreen

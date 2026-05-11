import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const TopBarLoader = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loader on route change
    setIsVisible(true);
    
    // Hide after a short delay (simulating page load)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            width: { duration: 0.6, ease: "easeOut" },
            opacity: { duration: 0.3, delay: 0.4 }
          }}
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-500 z-[9999] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
        />
      )}
    </AnimatePresence>
  );
};

export default TopBarLoader;

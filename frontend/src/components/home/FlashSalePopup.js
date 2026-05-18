import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiX, FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FlashSalePopup = () => {
  const [activeDeal, setActiveDeal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const { data } = await api.get('/flash-sales/active');
        if (data.vouchers && data.vouchers.length > 0) {
          // Select the most active/relevant flash voucher
          setActiveDeal(data.vouchers[0]);
          
          // Show popup after 3 seconds of landing on homepage
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 3000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn('Failed to fetch active deal for notification popup', err);
      }
    };
    fetchDeal();
  }, []);

  const handleCopy = () => {
    if (!activeDeal) return;
    navigator.clipboard.writeText(activeDeal.code);
    setCopied(true);
    toast.success(`Coupon code ${activeDeal.code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && activeDeal && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-yellow-500/20 glass-gold overflow-hidden"
        >
          {/* Glowing lightning background grid */}
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-yellow-500/10 blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
          >
            <FiX size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 animate-bounce">
              <FiZap size={22} className="fill-white" />
            </div>
            
            <div className="flex-1 pr-6">
              <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block mb-0.5">Flash Deal Active!</span>
              <h4 className="text-gray-900 font-extrabold text-base leading-tight mb-4">{activeDeal.description}</h4>


              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-yellow-50 hover:bg-yellow-100 border border-yellow-100 text-yellow-700 font-mono font-bold text-sm py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  {copied ? <FiCheck className="text-green-500" /> : <FiCopy className="text-yellow-600" />}
                  {activeDeal.code}
                </button>
                <Link
                  to={(() => {
                    const cat = activeDeal.applicableCategories?.[0];
                    if (cat) {
                      const catId = cat._id || cat;
                      return `/products?category=${catId}`;
                    }
                    return '/products';
                  })()}
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  Shop <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlashSalePopup;

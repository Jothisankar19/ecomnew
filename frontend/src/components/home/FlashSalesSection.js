import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiClock, FiCopy, FiCheck, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Dynamic Countdown Clock Component
const CountdownClock = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endTime) - new Date();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 font-mono text-white text-xs font-black bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 shadow-md">
      <FiClock className="text-yellow-400 animate-spin-slow" />
      <span>{pad(timeLeft.hours)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(timeLeft.minutes)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(timeLeft.seconds)}</span>
    </div>
  );
};

const FlashSalesSection = () => {
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchVouchers = async () => {
    try {
      const { data } = await api.get('/flash-sales/active');
      setActiveVouchers(data.vouchers || []);
    } catch (err) {
      console.warn('Could not fetch active flash vouchers', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Code ${code} copied! Apply at Checkout.`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-44 bg-white/5 rounded-3xl skeleton" />
      </div>
    );
  }

  if (activeVouchers.length === 0) {
    return null; // Don't show the flash section if there are no active sales
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Decorative Blur Background Bulbs */}
      <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-red-500/10 blur-3xl" />

      {/* Glassmorphic Shell */}
      <div className="glass-gold rounded-3xl p-6 md:p-8 border border-yellow-500/10 shadow-2xl relative overflow-hidden">
        {/* Glowing Lightning Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-2xl flex items-center justify-center border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
              <FiZap className="text-yellow-400 animate-bounce" size={24} />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Lightning Deals
              </h2>
              <p className="text-gray-500 text-xs md:text-sm font-medium mt-0.5">Time-limited custom vouchers. Act fast!</p>
            </div>
          </div>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <AnimatePresence>
            {activeVouchers.map((voucher) => {
              const claimPercentage = Math.round(((voucher.stockClaimed || 0) / voucher.totalStock) * 100);
              const itemsLeft = Math.max(0, voucher.totalStock - (voucher.stockClaimed || 0));

              return (
                <motion.div
                  key={voucher._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm flex flex-col justify-between gap-4 group hover:border-yellow-400 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      {/* Code Banner */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(voucher.code)}
                          className="font-mono font-black text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border border-yellow-100 rounded-xl px-4 py-2 text-base md:text-lg tracking-widest flex items-center gap-2 shadow-sm transition-all"
                        >
                          {voucher.code}
                          {copiedCode === voucher.code ? <FiCheck size={16} className="text-green-500" /> : <FiCopy size={16} className="opacity-40 group-hover:opacity-100" />}
                        </button>
                        {voucher.isFestivalPromo && (
                          <span className="bg-pink-50 text-pink-600 text-[9px] font-black uppercase px-2 py-1 rounded-lg border border-pink-100">Festive</span>
                        )}
                      </div>
                      <h4 className="text-gray-900 font-bold text-base mt-3 leading-tight">{voucher.description}</h4>
                    </div>

                    {/* Timer */}
                    <CountdownClock endTime={voucher.endTime} onExpire={fetchVouchers} />
                  </div>

                  {/* Stock Quota Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-wider">
                      <span>Limited Stock Offer</span>
                      <span className={itemsLeft <= 10 ? 'text-red-500 font-black animate-pulse' : 'text-gray-600'}>
                        {itemsLeft <= 10 ? `ONLY ${itemsLeft} CLAIMS LEFT!` : `${itemsLeft} available / ${voucher.totalStock} total`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div 
                        className={`h-full transition-all duration-700 rounded-full ${
                          claimPercentage >= 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                        }`} 
                        style={{ width: `${claimPercentage}%` }} 
                      />
                    </div>
                  </div>

                  {/* Pricing Details Row */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Savings Value</span>
                      <span className="text-yellow-600 font-black text-xl">
                        {voucher.discountType === 'percentage' ? `${voucher.discountValue}% OFF` : `₹${voucher.discountValue} OFF`}
                      </span>
                    </div>

                    <Link
                      to={(() => {
                        const cat = voucher.applicableCategories?.[0];
                        if (cat) {
                          const catId = cat._id || cat;
                          return `/products?category=${catId}`;
                        }
                        return '/products';
                      })()}
                      className="h-10 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <FiShoppingBag size={14} /> Shop Collection
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default FlashSalesSection;

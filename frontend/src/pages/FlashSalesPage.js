import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiClock, FiCopy, FiCheck, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';

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

const FlashSalesPage = () => {
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const [vouchersRes, productsRes] = await Promise.all([
        api.get('/flash-sales/active').catch(() => ({ data: { vouchers: [] } })),
        api.get('/products?hasDiscount=true&limit=12').catch(() => ({ data: { products: [] } }))
      ]);
      setActiveVouchers(vouchersRes.data?.vouchers || []);
      
      let products = productsRes.data?.products || [];
      // Fallback: If no products have an explicit discount, fetch trending/featured products so the page is never empty!
      if (products.length === 0) {
        const featuredRes = await api.get('/products/featured').catch(() => ({ data: {} }));
        products = featuredRes.data?.trending || featuredRes.data?.featured || [];
      }
      setDiscountedProducts(products);
    } catch (err) {
      console.warn('Could not fetch flash deals', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Code ${code} copied! Apply at Checkout.`);
  };

  return (
    <>
      <Helmet>
        <title>Flash Sales & Deals - Kurti Elegance</title>
        <meta name="description" content="Shop limited-time flash sale offers on premium ethnic kurtis before stocks run out!" />
      </Helmet>

      <div className="pt-20 min-h-screen bg-gray-50 pb-16 relative overflow-hidden">
        {/* Glowing Decorative Background Bulbs */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

        <div className="page-container py-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link to="/" className="hover:text-yellow-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Flash Sales</span>
          </nav>

          {/* Page Header */}
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full mb-4 shadow-inner">
              <FiZap size={32} className="animate-bounce" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Lightning Deals & Sales
            </h1>
            <p className="text-gray-500 text-base md:text-lg">
              Time-limited premium discounts, exclusive custom vouchers, and massive savings. Act fast before stock runs out!
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white rounded-3xl skeleton border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : activeVouchers.length === 0 && discountedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm max-w-3xl mx-auto">
              <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiZap size={40} className="text-yellow-500/80 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No active sales right now</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                There are no flash promotional campaigns running at this moment. Join our newsletter to get instant notifications when the next sale launches!
              </p>
              <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl shadow-lg">
                Shop All Collections <FiChevronRight />
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Active Campaigns */}
              {activeVouchers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl flex flex-col justify-between gap-5 group transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {/* Code Banner */}
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              onClick={() => handleCopy(voucher.code)}
                              className="font-mono font-black text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border border-yellow-100 rounded-xl px-4 py-1.5 text-sm tracking-widest flex items-center gap-2 transition-all cursor-copy"
                            >
                              {voucher.code}
                              {copiedCode === voucher.code ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} className="opacity-40 group-hover:opacity-100" />}
                            </button>
                            {voucher.isFestivalPromo && (
                              <span className="bg-pink-50 text-pink-600 text-[9px] font-black uppercase px-2 py-1 rounded-lg border border-pink-100">Festive</span>
                            )}
                          </div>
                          <h4 className="text-gray-900 font-bold text-lg leading-tight">{voucher.description}</h4>
                        </div>
                      </div>

                      {/* Timer Banner */}
                      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ends In</span>
                        <CountdownClock endTime={voucher.endTime} onExpire={fetchDeals} />
                      </div>

                      {/* Stock Quota Slider */}
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-wider">
                          <span>Limited Stock Offer</span>
                          <span className={itemsLeft <= 10 ? 'text-red-500 font-black animate-pulse' : 'text-gray-600'}>
                            {itemsLeft <= 10 ? `ONLY ${itemsLeft} CLAIMS LEFT!` : `${itemsLeft} available / ${voucher.totalStock} total`}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                          <div 
                            className={`h-full transition-all duration-700 rounded-full ${
                              claimPercentage >= 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                            }`} 
                            style={{ width: `${claimPercentage}%` }} 
                          />
                        </div>
                      </div>

                      {/* Pricing Details Row */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-2 mb-4">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Savings Value</span>
                          <span className="text-yellow-600 font-black text-2xl">
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
                          className="h-12 px-5 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <FiShoppingBag size={14} /> Shop Category
                        </Link>
                      </div>
                      
                      {/* Applicable Products Preview */}
                      {voucher.applicableProducts && voucher.applicableProducts.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                           <h5 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <FiZap className="text-yellow-500" /> Products on Sale
                           </h5>
                           <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                             {voucher.applicableProducts.map(product => (
                               <div key={product._id} className="w-[200px] flex-shrink-0">
                                 <ProductCard product={product} />
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                    </motion.div>
                  );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* General Discounted Products */}
              {discountedProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-serif text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <FiZap className="text-yellow-500" /> Deals & Discounts
                    </h2>
                    <Link to="/products?hasDiscount=true" className="text-sm font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1">
                      View All <FiChevronRight />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {discountedProducts.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FlashSalesPage;

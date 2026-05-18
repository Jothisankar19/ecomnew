import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiX } from 'react-icons/fi'
import { fetchFeaturedProducts } from '../store/slices/productSlice'
import { fetchCategories } from '../store/slices/categorySlice'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import HeroSection from '../components/home/HeroSection'
import CategoryGrid from '../components/home/CategoryGrid'
import Seo from '../components/ui/Seo'

import api from '../utils/api'

// ── Local kurti images ───────────────────────────────────────
import img1 from '../assets/091A6888.webp'
import img2 from '../assets/091A7701.webp'
import img3 from '../assets/091A7713.webp'
import img4 from '../assets/NIJU9620.webp'
import img5 from '../assets/NIJU9633.webp'
import sizeGuideImg from '../assets/kurti_size_guide_diagram.png'

/* ─── Helpers ────────────────────────────────────────────────── */
const SectionTitle = ({ tag, title, description, center = true }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={center ? 'text-center mb-10' : 'mb-8'}
    >
      {tag && (
        <span className="inline-block text-xs font-bold tracking-widest uppercase text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full mb-3">
          {tag}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">{description}</p>}
    </motion.div>
  )
}

/* ─── Features Bar ───────────────────────────────────────────── */
const FeaturesBar = () => {
  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹999', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer care', color: 'text-pink-500', bg: 'bg-pink-50' },
  ]
  return (
    <section className="py-6 md:py-10 border-b border-yellow-100/40 bg-transparent">
      <div className="page-container">
        <div className="flex overflow-x-auto no-scrollbar gap-8 md:grid md:grid-cols-4 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 md:gap-4 flex-shrink-0"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                <f.icon size={18} className={`md:size-[22px] ${f.color}`} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-[11px] md:text-sm whitespace-nowrap">{f.title}</p>
                <p className="text-gray-400 text-[10px] md:text-xs">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Dynamic Widescreen Promotional Sale Banner matching Countdown Screenshot ─── */
const SaleBanner = ({ activeCampaign, currentSlide, setCurrentSlide, totalSlides }) => {

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTime = () => {
      let expiry;
      if (activeCampaign) {
        expiry = activeCampaign.validUntil || activeCampaign.expiresAt;
      } else {
        // Fallback target date: 6 days, 14 hours, 52 mins, 45 secs from mount
        const date = new Date();
        date.setDate(date.getDate() + 6);
        date.setHours(date.getHours() + 14);
        date.setMinutes(date.getMinutes() + 52);
        date.setSeconds(date.getSeconds() + 45);
        expiry = date;
      }

      if (!expiry) return null;
      const diff = new Date(expiry) - new Date();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      return { d, h, m, s, expired: false };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCampaign]);

  // Determine dynamic variables
  let badgeText = "FLASH SALE ACTIVE";
  let titleText = "new";
  let saleValue = "10% OFF";
  let shopLink = "/products";

  if (activeCampaign) {
    const category = activeCampaign.applicableCategories?.[0];
    titleText = category?.name ? category.name.toLowerCase() : (activeCampaign.bannerText?.toLowerCase() || "new");
    saleValue = activeCampaign.discountType === 'percentage' 
      ? `${activeCampaign.discountValue}% OFF` 
      : `₹${activeCampaign.discountValue} OFF`;
    
    badgeText = activeCampaign.description ? activeCampaign.description.toUpperCase() : "FLASH SALE ACTIVE";

    shopLink = category 
      ? `/products?category=${category._id || category}` 
      : (activeCampaign.applicableProducts?.length > 0 
        ? `/products?ids=${activeCampaign.applicableProducts.map(p => p._id || p).join(',')}` 
        : `/products`);
  }

  // Format helper for numbers (adds leading zero)
  const formatNum = (num) => String(num || 0).padStart(2, '0');

  return (
    <section className="py-10 bg-transparent">
      <div className="page-container flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] shadow-2xl w-full min-h-[450px] md:min-h-[400px] flex items-center group"
          style={{ backgroundColor: '#1a1510' }}
        >
          {/* Dynamic Background Image: uses local custom uploaded banner image or falls back to the gorgeous green kurti model */}
          <img
            src={(activeCampaign && activeCampaign.bannerImage) ? activeCampaign.bannerImage : img4}
            alt="Promotion Model"
            className="absolute inset-0 w-full h-full block"
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
          />

          {/* Premium dark gradient fading from left-to-right to highlight overlay content */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 via-black/25 to-transparent" />

          {/* Left-aligned content structure matches screenshot exactly */}
          <div className="relative z-10 pl-6 sm:pl-12 md:pl-16 pr-4 py-8 max-w-xl text-left flex flex-col items-start">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-500/25 px-4 py-1.5 rounded-full mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-white text-[9px] font-black tracking-[0.22em] font-mono">
                {badgeText}
              </span>
            </div>

            {/* Campaign Header title in Lowercase Elegant Serif */}
            <h1 className="font-serif lowercase tracking-wide text-white text-4xl sm:text-5xl md:text-6xl font-light mb-1 leading-none">
              {titleText}
            </h1>

            {/* Italicized 'Sale' UPTO [discount] Sub-row */}
            <div className="flex items-baseline gap-2 mb-6">
              <span 
                className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-none"
                style={{ color: '#D4AF37', fontStyle: 'italic' }}
              >
                Sale
              </span>
              <span className="text-white/40 text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase ml-1 sm:ml-2">
                UPTO
              </span>
              <span className="text-white font-black text-2xl sm:text-3xl md:text-4xl tracking-tight uppercase ml-1">
                {saleValue}
              </span>
            </div>

            {/* Interactive Grid of Chronometer Cards */}
            {timeLeft && (
              <div className="flex items-center gap-1.5 md:gap-2 mb-7">
                {/* Days card */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
                  <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">
                    {formatNum(timeLeft.d)}
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">
                    DAYS
                  </span>
                </div>

                <span className="text-yellow-500 font-bold text-lg sm:text-xl">:</span>

                {/* Hours card */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
                  <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">
                    {formatNum(timeLeft.h)}
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">
                    HOURS
                  </span>
                </div>

                <span className="text-yellow-500 font-bold text-lg sm:text-xl">:</span>

                {/* Minutes card */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
                  <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">
                    {formatNum(timeLeft.m)}
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">
                    MINUTES
                  </span>
                </div>

                <span className="text-yellow-500 font-bold text-lg sm:text-xl">:</span>

                {/* Seconds card */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
                  <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">
                    {formatNum(timeLeft.s)}
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">
                    SECONDS
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic CTA pill link with subtle yellow-gold hover glow */}
            <Link to={shopLink}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-black text-[10px] md:text-xs tracking-widest uppercase px-6 sm:px-8 py-3.5 rounded-full transition-all shadow-[0_4px_20px_rgba(234,179,8,0.35)] hover:shadow-[0_4px_25px_rgba(234,179,8,0.6)] flex items-center gap-2 border-0 cursor-pointer"
              >
                SHOP COLLECTION <span className="text-white font-black">→</span>
              </motion.button>
            </Link>

          </div>

          {/* Carousel Navigation Dots */}
          {totalSlides > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === i ? 'bg-yellow-400 w-6' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </section>
  );
};

/* ─── Shop By Type ───────────────────────────────────────────── */
const ShopByType = ({ categories }) => {
  const types = categories?.length > 0 ? categories.slice(0, 6).map(cat => ({
    name: cat.name,
    slug: cat.slug,
    desc: cat.description || 'Premium Quality',
    img: cat.image?.url || img1
  })) : [
    { name: 'Anarkali', slug: 'anarkali-kurtis', desc: 'Flared & Elegant', img: img1 },
    { name: 'A-Line', slug: 'a-line-kurtis', desc: 'Slim & Flattering', img: img2 },
    { name: 'Straight Cut', slug: 'straight-kurtis', desc: 'Classic & Versatile', img: img3 },
    { name: 'Printed', slug: 'printed-kurtis', desc: 'Bold & Vibrant', img: img4 },
    { name: 'Embroidered', slug: 'embroidered-kurtis', desc: 'Intricate & Festive', img: img5 },
    { name: 'Kaftan', slug: 'kaftan-kurtis', desc: 'Flowy & Comfortable', img: img1 },
  ]
  return (
    <section className="py-14 bg-transparent">
      <div className="page-container">
        <SectionTitle tag="Kurti Types" title="Shop By Style" description="Find your perfect kurti silhouette" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {types.map((type, i) => (
            <motion.div
              key={type.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <Link to={`/category/${type.slug}`} className="block group text-left">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-3 shadow-md border border-gray-100/40 group-hover:border-yellow-400 group-hover:shadow-xl transition-all duration-500">
                  <img
                    src={type.img}
                    alt={type.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Premium Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  
                  {/* Left-Aligned Premium Typography Block */}
                  <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end min-h-[45%]">
                    <h4 className="text-white font-serif text-sm sm:text-base font-bold tracking-wide mb-1.5 transition-colors group-hover:text-yellow-400">
                      {type.name}
                    </h4>
                    {/* Expandable gold divider accent */}
                    <div className="w-8 h-[2px] bg-yellow-500 mb-2 transition-all duration-300 group-hover:w-16" />
                    <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed font-sans font-light line-clamp-3 transition-colors group-hover:text-white">
                      {type.desc}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Shop By Age Group ──────────────────────────────────────── */
const ShopByAge = () => {
  const ageGroups = [
    {
      name: "Women's Kurtis", slug: 'womens-kurtis', age: '18 – 45 yrs',
      desc: 'Trendy, elegant & office-ready styles',
      img: img2, badge: 'Most Popular', badgeColor: 'bg-yellow-500',
    },
    {
      name: "Girls' Kurtis", slug: 'girls-kurtis', age: '8 – 17 yrs',
      desc: 'Cute, colourful & comfortable designs',
      img: img3, badge: 'New Arrivals', badgeColor: 'bg-pink-500',
    },
    {
      name: "Senior Women's Kurtis", slug: 'senior-kurtis', age: '45+ yrs',
      desc: 'Comfortable, modest & graceful cuts',
      img: img4, badge: 'Bestseller', badgeColor: 'bg-purple-500',
    },
  ]
  return (
    <section className="py-14 bg-transparent">
      <div className="page-container">
        <SectionTitle tag="Age Groups" title="Shop By Age" description="Kurtis designed for every stage of life" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ageGroups.map((group, i) => (
            <motion.div
              key={group.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link to={`/category/${group.slug}`} className="block group relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all">
                <img
                  src={group.img}
                  alt={group.name}
                  className="w-full h-72 object-cover object-top group-hover:scale-105 transition-transform duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Badge */}
                <span className={`absolute top-4 left-4 ${group.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {group.badge}
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-yellow-300 text-xs font-bold tracking-widest uppercase mb-1">{group.age}</p>
                  <h3 className="font-display text-2xl font-bold text-white mb-1">{group.name}</h3>
                  <p className="text-white/70 text-sm mb-3">{group.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold border border-white/40 rounded-full px-4 py-1.5 group-hover:bg-white group-hover:text-gray-800 transition-all">
                    Shop Now <FiArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Size Guide Banner ──────────────────────────────────────── */
const SizeGuideBanner = () => {
  const [activeSize, setActiveSize] = useState('M')
  const sizes = [
    { size: 'XS', chest: '32"', waist: '26"', hip: '34"', length: '44"' },
    { size: 'S', chest: '34"', waist: '28"', hip: '36"', length: '44"' },
    { size: 'M', chest: '36"', waist: '30"', hip: '38"', length: '46"' },
    { size: 'L', chest: '38"', waist: '32"', hip: '40"', length: '46"' },
    { size: 'XL', chest: '40"', waist: '34"', hip: '42"', length: '48"' },
    { size: 'XXL', chest: '42"', waist: '36"', hip: '44"', length: '48"' },
    { size: 'XXXL', chest: '44"', waist: '38"', hip: '46"', length: '50"' },
    { size: 'Free Size', chest: '36–42"', waist: '30–36"', hip: '38–44"', length: '46"' },
  ]
  
  const currentSizeData = sizes.find(s => s.size === activeSize)

  return (
    <section className="py-14 bg-transparent overflow-hidden">
      <div className="page-container">
        <SectionTitle tag="Size Guide" title="Find Your Perfect Fit" description="All our kurtis are available in XS to XXXL and Free Size" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: How to Measure Diagram */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 flex flex-col items-center"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all" />
              <img 
                src={sizeGuideImg} 
                alt="How to Measure Kurti" 
                className="relative w-full max-w-[320px] h-auto drop-shadow-2xl"
              />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Chest</p>
                <p className="text-sm font-semibold text-gray-700">Measure around the fullest part</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Waist</p>
                <p className="text-sm font-semibold text-gray-700">Measure at the narrowest point</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Size Selection / Table */}
          <div className="lg:col-span-7">
            {/* Mobile: Interactive Card View */}
            <div className="lg:hidden space-y-6">
              <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setActiveSize(s.size)}
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                      activeSize === s.size 
                        ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-200 scale-110' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-yellow-200'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tighter">Size</span>
                    <span className="text-lg font-black">{s.size}</span>
                  </button>
                ))}
              </div>

              <motion.div
                key={activeSize}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 text-white shadow-xl shadow-yellow-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <span className="text-8xl font-black">{activeSize}</span>
                </div>
                <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                   Measurements for {activeSize}
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                   {[
                     { label: 'Chest', value: currentSizeData.chest },
                     { label: 'Waist', value: currentSizeData.waist },
                     { label: 'Hip', value: currentSizeData.hip },
                     { label: 'Length', value: currentSizeData.length },
                   ].map((item) => (
                     <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-2xl font-black">{item.value}</p>
                     </div>
                   ))}
                </div>
              </motion.div>
            </div>

            {/* Desktop: Table View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="hidden lg:block table-responsive shadow-2xl rounded-3xl overflow-hidden border border-gray-100"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-yellow-500 border-b border-yellow-600">
                    <th className="text-left px-6 py-4 text-white font-bold text-xs uppercase tracking-wider">Size</th>
                    <th className="text-center px-6 py-4 text-white font-bold text-xs uppercase tracking-wider">Chest</th>
                    <th className="text-center px-6 py-4 text-white font-bold text-xs uppercase tracking-wider">Waist</th>
                    <th className="text-center px-6 py-4 text-white font-bold text-xs uppercase tracking-wider">Hip</th>
                    <th className="text-center px-6 py-4 text-white font-bold text-xs uppercase tracking-wider">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((row, i) => (
                    <tr
                      key={row.size}
                      className={`border-b border-gray-50 hover:bg-yellow-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      <td className="px-6 py-4 font-bold text-gray-800 text-lg">{row.size}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{row.chest}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{row.waist}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{row.hip}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-[10px] mt-10 uppercase tracking-widest font-bold">
          * Measurements are in inches · Sizes may vary slightly by style · Standard Indian Fitting
        </p>
      </div>
    </section>
  )
}

/* ─── Product Section ────────────────────────────────────────── */
const ProductSection = ({ tag, title, description, products, link, loading }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section ref={ref} className="py-14 bg-transparent">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <SectionTitle tag={tag} title={title} description={description} center={false} />
          <Link
            to={link}
            className="hidden md:inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold text-sm border-b-2 border-yellow-400 pb-0.5 transition-colors mb-8"
          >
            View All <FiArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <SkeletonGrid count={8} />
        ) : products?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="flex md:grid overflow-x-auto no-scrollbar md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 -mx-4 px-4 md:mx-0 md:px-0"
          >
            {products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.05 }}
                className="w-[180px] sm:w-[220px] md:w-auto flex-shrink-0"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex md:grid overflow-x-auto no-scrollbar md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 -mx-4 px-4 md:mx-0 md:px-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-[180px] sm:w-[220px] md:w-auto flex-shrink-0 rounded-2xl overflow-hidden border border-gray-100">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8 md:hidden">
          <Link to={link} className="btn-secondary inline-flex items-center gap-2 text-sm">
            View All <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Promo Banners ──────────────────────────────────────────── */
const PromoBanners = () => (
  <section className="py-12 bg-transparent">
    <div className="page-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            img: 'https://images.unsplash.com/photo-1608976478512-ef30825cd41c?w=800&q=80',
            tag: 'New Arrivals', tagColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
            title: 'Anarkali\nKurtis', cta: 'Shop Now',
            ctaColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-yellow-500/20',
            link: '/category/anarkali-kurtis',
          },
          {
            img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
            tag: 'Limited Time', tagColor: 'text-pink-400 border-pink-500/30 bg-pink-500/5',
            title: 'Flat 50% OFF\nPrinted Kurtis', cta: 'Grab Deal',
            ctaColor: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-pink-500/20',
            link: '/category/printed-kurtis',
          },
          {
            img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
            tag: 'Festival Special', tagColor: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
            title: 'Embroidered\nKurtis', cta: 'Explore',
            ctaColor: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-purple-500/20',
            link: '/category/embroidered-kurtis',
          },
        ].map((b, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-3xl h-64 cursor-pointer group shadow-lg border border-gray-100/50 hover:border-white/20 transition-all duration-300"
          >
            {/* Deep Zoom Image Background */}
            <img 
              src={b.img} 
              alt={b.title} 
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-[1.2s] ease-out" 
            />
            {/* Rich Luxury Vignette: Heavy on left to make text pop, light on right to showcase garments */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
            
            {/* Floating Banner Contents */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
              <span className={`inline-block w-fit px-3 py-1 rounded-full border text-[10px] font-extrabold tracking-[0.2em] uppercase mb-3 ${b.tagColor}`}>
                {b.tag}
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-white mb-5 leading-tight tracking-wide whitespace-pre-line drop-shadow-sm group-hover:text-gray-100 transition-colors">
                {b.title}
              </h3>
              <Link 
                to={b.link} 
                className={`inline-flex items-center gap-2 ${b.ctaColor} text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-2xl w-fit transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]`}
              >
                {b.cta} <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

/* ─── Testimonials ───────────────────────────────────────────── */
const TestimonialsSection = () => {
  const reviews = [
    { name: 'Priya Sharma', city: 'Chennai', rating: 5, text: 'The Anarkali kurti fits perfectly! The fabric is so soft and the embroidery is stunning. Will definitely order again.', product: 'Floral Anarkali Kurti', avatar: 'P' },
    { name: 'Meera Patel', city: 'Mumbai', rating: 5, text: 'Fast delivery and beautiful packaging. The printed kurti looks even better in person!', product: 'Block Print Straight Kurti', avatar: 'M' },
    { name: 'Ananya Reddy', city: 'Hyderabad', rating: 5, text: 'Perfect fit and gorgeous design. Got so many compliments at the festival!', product: 'Embroidered A-Line Kurti', avatar: 'A' },
  ]
  return (
    <section className="py-14 bg-transparent">
      <div className="page-container">
        <SectionTitle tag="Customer Love" title="What Our Customers Say" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(r.rating)].map((_, j) => (
                  <FiStar key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 italic">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">{r.avatar}</span>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">{r.name}</p>
                  <p className="text-gray-400 text-xs">{r.city} · {r.product}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Video Section ─────────────────────────────────────────────── */
const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full h-[500px] md:h-[700px] bg-black overflow-hidden flex items-center justify-center">
      {/* Background Image / Video Poster */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <img 
          src="https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&q=80" 
          alt="Sewing Craft" 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      {/* Video Element */}
      {isPlaying && (
        <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
          <button 
            onClick={() => setIsPlaying(false)}
            className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors border border-white/20"
          >
            <FiX size={24} />
          </button>
          <iframe 
            className="w-full h-full max-w-6xl max-h-[80vh] aspect-video"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&modestbranding=1" 
            title="Featured Video" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Overlay Content */}
      {!isPlaying && (
        <div className="relative z-10 flex flex-col items-center text-center px-4 mt-8">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/90 text-sm tracking-[0.15em] mb-4 font-medium font-sans"
          >
            Featured Video
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white font-serif text-4xl md:text-5xl lg:text-6xl mb-12 tracking-wide font-light"
          >
            A Glimpse Of Our Craft
          </motion.h2>

          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            onClick={() => setIsPlaying(true)}
            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,0,0,0.4)] group cursor-pointer border-none"
          >
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent ml-2 group-hover:scale-110 transition-transform" />
          </motion.button>
        </div>
      )}
    </section>
  )
}

/* ─── Scrollable Category Sale Banner Ribbon ─── */
const CategorySaleScrollBanner = ({ coupons }) => {
  // Filter coupons that have category targets
  const categoryCoupons = coupons.filter(c => c.applicableCategories && c.applicableCategories.length > 0 && c.isActive);

  if (categoryCoupons.length === 0) return null;

  return (
    <section className="py-6 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border-y border-yellow-100 overflow-hidden relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-red-600">Category Clearance Deals</span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Swipe left to explore ›</span>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-3 no-scrollbar scroll-smooth">
        {categoryCoupons.map((coupon) => {
          const category = coupon.applicableCategories[0];
          if (!category) return null;
          
          return (
            <motion.div
              key={coupon._id}
              whileHover={{ y: -3 }}
              className="bg-white rounded-3xl p-5 shadow-sm border border-yellow-100/50 flex-shrink-0 w-80 relative overflow-hidden animate-fade-in"
            >
              {/* Gold/Yellow Glow corner badge */}
              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-bl-2xl">
                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Style Category Sale</span>
                <h4 className="text-gray-900 font-extrabold text-lg leading-tight">{category.name}</h4>
                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{coupon.description || 'Intricate kurti designs on special sale.'}</p>
                
                {/* Clean Call To Action without messy code display */}
                <Link 
                  to={`/products?category=${category._id}`} 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-[11px] font-extrabold uppercase tracking-widest py-3 rounded-2xl text-center transition-all mt-3 w-full block shadow-sm"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};



/* ─── Scroll Stitch Divider ────────────────────────────────── */
const ScrollStitchDivider = ({ text = "Tailored Elegance" }) => {
  const containerRef = useRef(null);
  const [stitchProgress, setStitchProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress starting from bottom edge entry up to middle/top focus area
      const entryPoint = rect.top - windowHeight;
      const totalDistance = windowHeight * 0.85; // Animates smoothly over the viewport sweep
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = Math.min(Math.max(-entryPoint / totalDistance, 0), 1);
        setStitchProgress(progress * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount to set initial position
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full py-6 overflow-hidden bg-transparent select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-6 flex items-center">
        {/* Fabric Crease Guide (Soft Shadow Line) */}
        <div className="absolute left-4 right-4 h-[1px] bg-yellow-800/10" />

        {/* Dotted Guide Punch Holes */}
        <div className="absolute left-4 right-4 h-[2px] border-t border-dotted border-yellow-800/20" />

        {/* Dynamic Glowing Gold Stitch */}
        <div 
          className="absolute left-4 h-0 border-t-2 border-dashed border-yellow-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(217,119,6,0.15)]"
          style={{ width: `calc(${stitchProgress}% - 28px)` }}
        />

        {/* Sewing Needle & trailing thread sliding dynamically with scroll */}
        <div 
          className="absolute transition-all duration-75 ease-out flex items-center"
          style={{ 
            left: `calc(16px + ${stitchProgress}%)`, 
            transform: 'translateY(-50%)', 
            top: '50%',
            opacity: stitchProgress > 0 && stitchProgress < 100 ? 1 : 0.9 // maintain beautiful fading at limits
          }}
        >
          <svg 
            className="w-10 h-6 text-yellow-600 -rotate-[15deg] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" 
            viewBox="0 0 40 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Elegant wavy thread trailing from the needle eye */}
            <path 
              d="M0,12 C4,10 6,14 10,12" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              strokeDasharray="2,2" 
              fill="none" 
            />
            {/* The golden needle body */}
            <path 
              d="M10,12 L34,12 L39,11.5 L34,11 L10,11 Z" 
              fill="currentColor" 
            />
            {/* Detailed needle eye cutout */}
            <ellipse 
              cx="13" 
              cy="11.5" 
              rx="1.8" 
              ry="0.6" 
              fill="#FAF6EE" 
            />
          </svg>
          {/* Subtle tailored craft branding badge */}
          <span className="text-[8px] uppercase tracking-[0.25em] text-yellow-600/50 ml-3 font-mono hidden sm:inline whitespace-nowrap bg-yellow-500/5 border border-yellow-500/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};



/* ─── HomePage ───────────────────────────────────────────────── */
const HomePage = () => {
  const dispatch = useDispatch()
  const { featured, loading } = useSelector((state) => state.products)
  const { categories } = useSelector((state) => state.categories)
  const [activePromos, setActivePromos] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchCategories())

    api.get('/coupons/active')
      .then(({ data }) => setActivePromos(data.coupons || []))
      .catch(err => console.error('Failed to load active category promos', err))
  }, [dispatch])

  const bannerCoupons = activePromos.filter(c => c.showBanner && c.isActive);
  const activeCampaign = bannerCoupons[currentSlide] || bannerCoupons[0];

  useEffect(() => {
    if (bannerCoupons.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerCoupons.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerCoupons.length]);

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ethnic Elegance",
      "url": "https://kurtielegance.com",
      "logo": "https://kurtielegance.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-000-000-0000",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": "en"
      },
      "sameAs": [
        "https://facebook.com/kurtielegance",
        "https://instagram.com/kurtielegance"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://kurtielegance.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://kurtielegance.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <>
      <Seo 
        title="Premium Kurti Store | Anarkali, Printed, Embroidered Kurtis"
        description="Shop premium kurtis — Anarkali, A-Line, Printed, Embroidered, Casual & Party Wear. Sizes XS to XXXL. Free shipping above ₹999."
        keywords="kurtis, anarkali kurti, printed kurti, embroidered kurti, cotton kurti, party wear kurti, women kurti"
        schema={homeSchema}
      />

      {/* 1. Hero Slider */}
      <HeroSection />

      {/* 2. Features Bar */}
      <FeaturesBar />

      {/* 3. Sale Banner — full width promotional banner */}
      <SaleBanner 
        activeCampaign={activeCampaign} 
        currentSlide={currentSlide} 
        setCurrentSlide={setCurrentSlide} 
        totalSlides={bannerCoupons.length} 
      />

      <ScrollStitchDivider text="Hand-Tailoring Excellence" />

      {/* 4. Shop By Kurti Type */}
      <ShopByType categories={categories} />

      {/* 4. Trending Kurtis */}
      <ProductSection
        tag="🔥 Hot Picks"
        title="Trending Kurtis"
        description="Most loved kurti styles this season"
        products={featured?.trending}
        link="/products?isTrending=true"
        loading={loading && !featured}
      />

      <ScrollStitchDivider text="Intricate Embroidery Stitches" />

      {/* 5. Promo Banners */}
      <PromoBanners />

      {/* 6. New Arrivals */}
      <ProductSection
        tag="✨ Just In"
        title="New Kurti Arrivals"
        description="Fresh designs added every week"
        products={featured?.newArrivals}
        link="/products?isNewArrival=true"
        loading={loading && !featured}
      />

      {/* 7. Shop By Age Group */}
      <ShopByAge />

      {/* 8. Best Sellers */}
      <ProductSection
        tag="⭐ Most Loved"
        title="Best Selling Kurtis"
        description="Customer favourites — tried, tested and adored"
        products={featured?.bestSellers}
        link="/products?isBestSeller=true"
        loading={loading && !featured}
      />

      <ScrollStitchDivider text="Block-Print & Custom Craftsmanship" />

      {/* 9. All Kurti Categories */}
      <section className="py-14 bg-transparent">
        <div className="page-container">
          <SectionTitle tag="All Collections" title="Browse All Kurti Types" description="From casual cotton to festive embroidered — we have every kurti you need" />
          <CategoryGrid />
        </div>
      </section>

      {/* 10. Size Guide */}
      <SizeGuideBanner />

      {/* 11. Testimonials */}
      <TestimonialsSection />

      {/* 12. Video Section */}
      <VideoSection />

    </>
  )
}

export default HomePage

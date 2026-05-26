import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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
import sampleVideo from '../assets/sample/55d32136729648abb050b07719f6cc61.HD-720p-2.1Mbps-81321222.mp4'

/* ─── Helpers ────────────────────────────────────────────────── */

// Resolve a saved banner's link to a products?category={id} URL when possible
const resolveBannerLink = (cust, def, categories = []) => {
  if (!cust) return def.link
  const categoryId = cust?.categoryId?._id || cust?.categoryId
  if (categoryId) {
    const cat = (categories || []).find(c => c._id === categoryId)
    if (cat) return `/category/${cat.slug}`
    return `/products?category=${categoryId}`
  }
  const url = cust.link || ''
  const m = url.match(/[?&]category=([^&]+)/)
  if (m) return `/products?category=${m[1]}`
  const s = url.match(/\/category\/([^/?#]+)/)
  if (s) {
    const slug = decodeURIComponent(s[1])
    const cat = (categories || []).find(c => c.slug === slug)
    if (cat) return `/products?category=${cat._id}`
    return url
  }
  return url || def.link
}

const getGridColsClass = (count) => {
  if (count === 1) return "grid grid-cols-1 max-w-xl mx-auto gap-6";
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6";
  if (count % 4 === 0) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";
  return "grid grid-cols-1 md:grid-cols-3 gap-6";
}

/** Tracks horizontal scroll edges and scrolls by one card width */
const useHorizontalScroll = (itemCount) => {
  const scrollRef = useRef(null)
  const edgesRef = useRef({ left: false, right: false, overflow: false })
  const rafRef = useRef(null)
  const [edges, setEdges] = useState(edgesRef.current)

  const refreshEdges = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const overflow = el.scrollWidth > el.clientWidth + 4
    const next = {
      overflow,
      left: overflow && el.scrollLeft > 8,
      right: overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
    }
    const prev = edgesRef.current
    if (prev.overflow === next.overflow && prev.left === next.left && prev.right === next.right) return
    edgesRef.current = next
    setEdges(next)
  }, [])

  const scheduleRefresh = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      refreshEdges()
    })
  }, [refreshEdges])

  const scrollByCard = useCallback((direction) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('[data-scroll-card]')
    const gap = 20
    const step = card ? card.offsetWidth + gap : Math.round(el.clientWidth * 0.85)
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    refreshEdges()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(scheduleRefresh)
    ro.observe(el)
    el.addEventListener('scroll', scheduleRefresh, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', scheduleRefresh)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [itemCount, refreshEdges, scheduleRefresh])

  return { scrollRef, edges, scrollByCard }
}

const ScrollCard = ({ className = '', children }) => (
  <div
    data-scroll-card
    className={`snap-start flex-shrink-0 transition-transform duration-300 md:hover:-translate-y-1 ${className}`}
  >
    {children}
  </div>
)

const HorizontalScrollRow = memo(({
  itemCount,
  ariaLabel,
  gap = 'gap-5',
  className = '',
  children,
}) => {
  const { scrollRef, edges, scrollByCard } = useHorizontalScroll(itemCount)

  return (
    <>
      {edges.overflow && (
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!edges.left}
              aria-label={`Scroll ${ariaLabel} left`}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600 hover:border-yellow-400 hover:text-yellow-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!edges.right}
              aria-label={`Scroll ${ariaLabel} right`}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600 hover:border-yellow-400 hover:text-yellow-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-auto">
            <span className="w-5 h-[1px] bg-gray-300" />
            Swipe to explore more ›
          </span>
        </div>
      )}
      <div className="relative">
        {edges.overflow && edges.left && (
          <div className="absolute left-0 top-0 bottom-2 w-10 sm:w-14 bg-gradient-to-r from-[#FAF6EE] to-transparent z-10 pointer-events-none" />
        )}
        {edges.overflow && edges.right && (
          <div className="absolute right-0 top-0 bottom-2 w-10 sm:w-14 bg-gradient-to-l from-[#FAF6EE] to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={scrollRef}
          role="region"
          aria-label={ariaLabel}
          tabIndex={0}
          className={`h-scroll-row flex ${gap} overflow-x-auto no-scrollbar scroll-touch snap-x snap-mandatory pb-2 -mx-4 px-4 sm:px-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 rounded-2xl ${className}`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCard(-1) }
            if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1) }
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
})
HorizontalScrollRow.displayName = 'HorizontalScrollRow'

const SectionTitle = ({ tag, title, description, center = true }) => (
    <div className={center ? 'text-center mb-10' : 'mb-8'}>
      {tag && (
        <span className="inline-block text-xs font-bold tracking-widest uppercase text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full mb-3">
          {tag}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-400 max-w-xl  mx-auto text-sm leading-relaxed">{description}</p>}
    </div>
)

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
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 md:gap-4 flex-shrink-0"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                <f.icon size={18} className={`md:size-[22px] ${f.color}`} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-[11px] md:text-sm whitespace-nowrap">{f.title}</p>
                <p className="text-gray-400 text-[10px] md:text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const SaleCountdown = memo(({ activeCampaign, loading }) => {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (loading) return
    const calculateTime = () => {
      let expiry
      if (activeCampaign) {
        expiry = activeCampaign.validUntil || activeCampaign.expiresAt
      } else {
        const date = new Date()
        date.setDate(date.getDate() + 6)
        date.setHours(date.getHours() + 14)
        date.setMinutes(date.getMinutes() + 52)
        date.setSeconds(date.getSeconds() + 45)
        expiry = date
      }
      if (!expiry) return null
      const diff = new Date(expiry) - new Date()
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true }
      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
        expired: false,
      }
    }
    const tick = () => {
      const next = calculateTime()
      setTimeLeft((prev) => {
        if (!prev || !next) return next
        if (prev.d === next.d && prev.h === next.h && prev.m === next.m && prev.s === next.s) return prev
        return next
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeCampaign, loading])

  if (!timeLeft || timeLeft.expired) return null

  const formatNum = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
        <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">{formatNum(timeLeft.d)}</span>
        <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">DAYS</span>
      </div>
      <span className="text-yellow-500 font-bold text-lg sm:text-xl">:</span>
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
        <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">{formatNum(timeLeft.h)}</span>
        <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">HOURS</span>
      </div>
      <span className="text-yellow-500 font-bold text-lg sm:text-xl">:</span>
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
        <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">{formatNum(timeLeft.m)}</span>
        <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">MINUTES</span>
      </div>
      <span className="text-yellow-500 font-bold text-lg sm:text-xl">:</span>
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border border-white/10 bg-black/60 flex flex-col items-center justify-center">
        <span className="text-yellow-500 font-serif text-base sm:text-lg md:text-xl font-bold leading-tight">{formatNum(timeLeft.s)}</span>
        <span className="text-[7px] sm:text-[8px] text-white/50 tracking-widest uppercase font-bold mt-0.5">SECONDS</span>
      </div>
    </div>
  )
})

/* ─── Dynamic Widescreen Promotional Sale Banner matching Countdown Screenshot ─── */
const SaleBanner = ({ activeCampaign, currentSlide, setCurrentSlide, totalSlides, loading }) => {

  if (loading) {
    return (
      <section className="py-10 bg-transparent">
        <div className="page-container flex justify-center">
          <div
            className="relative overflow-hidden rounded-[2.5rem] shadow-2xl w-full min-h-[450px] md:min-h-[400px] flex items-center p-6 sm:p-12 md:p-16"
            style={{ backgroundColor: '#16110c' }}
          >
            {/* Widescreen dark luxury gradient skeleton backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-950/10 via-black/50 to-yellow-950/10 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1a130d] via-black/80 to-transparent" />
            
            <div className="relative z-10 w-full max-w-xl text-left flex flex-col items-start space-y-6">
              {/* Badge Shimmer */}
              <div className="h-6 w-36 rounded-full bg-white/5 animate-pulse border border-white/5" />
              
              {/* Title Shimmer */}
              <div className="space-y-2">
                <div className="h-10 w-48 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-12 w-64 rounded-xl bg-white/5 animate-pulse" />
              </div>
              
              {/* Chronometer Grid Shimmer */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
              
              {/* CTA Pill Shimmer */}
              <div className="h-11 w-44 rounded-full bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

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

  return (
    <section className="py-10 bg-transparent">
      <div className="page-container flex justify-center">
        <div
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

            <div className="mb-7">
              <SaleCountdown activeCampaign={activeCampaign} loading={loading} />
            </div>

            <Link to={shopLink}>
              <button
                type="button"
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-black text-[10px] md:text-xs tracking-widest uppercase px-6 sm:px-8 py-3.5 rounded-full transition-all shadow-[0_4px_20px_rgba(234,179,8,0.35)] hover:shadow-[0_4px_25px_rgba(234,179,8,0.6)] flex items-center gap-2 border-0 cursor-pointer"
              >
                SHOP COLLECTION <span className="text-white font-black">→</span>
              </button>
            </Link>

          </div>

          {/* Carousel Navigation Dots */}
          {totalSlides > 1 && (
            <div
              className="absolute flex justify-center gap-2 z-20"
              style={{ insetInlineStart: 0, insetInlineEnd: 0, insetBlockEnd: '1rem' }}
            >
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

        </div>
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
        <HorizontalScrollRow itemCount={types.length} ariaLabel="Kurti styles" gap="gap-4">
          {types.map((type) => (
            <ScrollCard
              key={type.slug}
              className="w-[min(68vw,200px)] sm:w-[min(42vw,220px)] md:w-[min(28vw,200px)] lg:w-[min(22vw,220px)]"
            >
              <Link to={`/category/${type.slug}`} className="block group text-left">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-gray-100/40 group-hover:border-yellow-400 group-hover:shadow-xl transition-all duration-500">
                  <img
                    src={type.img}
                    alt={type.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top md:group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  <div
                    className="absolute inset-x-0 p-4 flex flex-col justify-end min-h-[45%]"
                    style={{ insetBlockEnd: 0 }}
                  >
                    <h4 className="text-white font-serif text-sm sm:text-base font-bold tracking-wide mb-1.5 transition-colors group-hover:text-yellow-400">
                      {type.name}
                    </h4>
                    <div className="w-8 h-[2px] bg-yellow-500 mb-2 transition-all duration-300 group-hover:w-16" />
                    <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed font-sans font-light line-clamp-3 transition-colors group-hover:text-white">
                      {type.desc}
                    </p>
                  </div>
                </div>
              </Link>
            </ScrollCard>
          ))}
        </HorizontalScrollRow>
      </div>
    </section>
  )
}

/* ─── Shop By Occasion ──────────────────────────────────────── */
const ShopByOccasion = ({ customBanners = [] }) => {
  const { categories } = useSelector((state) => state.categories)
  const defaultOccasions = [
    {
      name: "Casual Wear", slug: 'casual-kurtis', subtitle: 'Everyday Comfort',
      desc: 'Breathable, simple, and perfect for daily wear.',
      img: img2, badge: 'Daily Staples', badgeColor: 'bg-green-500',
      link: '/products?hasDiscount=true',
    },
    {
      name: "Festive Wear", slug: 'party-wear-kurtis', subtitle: 'Celebration Ready',
      desc: 'Glamorous, embroidered, and ready for parties.',
      img: img3, badge: 'Trending Now', badgeColor: 'bg-pink-500',
      link: '/products?hasDiscount=true',
    },
    {
      name: "Office Wear", slug: 'office-wear-kurtis', subtitle: 'Professional Elegance',
      desc: 'Smart, subtle prints, and sophisticated cuts.',
      img: img4, badge: 'Work Essentials', badgeColor: 'bg-blue-500',
      link: '/products?hasDiscount=true',
    },
  ]

  const occasionBadgeColors = ['bg-green-500', 'bg-pink-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500'];

  const occasions = (customBanners && customBanners.length > 0)
    ? customBanners.map((cust, idx) => {
        const def = defaultOccasions[idx % defaultOccasions.length];
        let customImg = def.img;
        if (cust.img) {
          customImg = typeof cust.img === 'string' ? cust.img : (cust.img.url || def.img);
        }
        return {
          name: cust.name || 'Style Pack',
          subtitle: cust.subtitle || 'Elegant Collection',
          desc: cust.desc || 'Premium kurtis designed for maximum grace and beauty.',
          img: customImg,
          badge: cust.badge || 'Trending',
          badgeColor: occasionBadgeColors[idx % occasionBadgeColors.length],
          link: resolveBannerLink(cust, def, categories),
          slug: def.slug || `custom-occasion-${idx}`
        }
      })
    : defaultOccasions;

  return (
    <section className="py-14 bg-transparent">
      <div className="page-container">
        <SectionTitle tag="Occasions" title="Shop By Occasion" description="Find the perfect style for every moment" />
        <HorizontalScrollRow itemCount={occasions.length} ariaLabel="Shop by occasion" gap="gap-6">
          {occasions.map((group, i) => (
            <ScrollCard
              key={group.slug || i}
              className="w-[min(85vw,300px)] sm:w-[min(50vw,320px)] md:w-[min(38vw,360px)]"
            >
              <Link to={group.link || `/category/${group.slug}`} className="block group relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all w-full">
                <img
                  src={group.img}
                  alt={group.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-72 object-cover object-top md:group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span
                  className={`absolute ${group.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                  style={{ insetInlineStart: '1rem', insetBlockStart: '1rem' }}
                >
                  {group.badge}
                </span>
                <div
                  className="absolute p-5"
                  style={{ insetInlineStart: 0, insetInlineEnd: 0, insetBlockEnd: 0 }}
                >
                  <p className="text-yellow-300 text-xs font-bold tracking-widest uppercase mb-1">{group.subtitle}</p>
                  <h3 className="font-display text-2xl font-bold text-white mb-1">{group.name}</h3>
                  <p className="text-white/70 text-sm mb-3">{group.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold border border-white/40 rounded-full px-4 py-1.5 group-hover:bg-white group-hover:text-gray-800 transition-all">
                    Shop Now <FiArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </ScrollCard>
          ))}
        </HorizontalScrollRow>
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
              <Link to={group.link || `/category/${group.slug}`} className="block group relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all">
                <img
                  src={group.img}
                  alt={group.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-72 object-cover object-top group-hover:scale-105 transition-transform duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Badge */}
                <span
                  className={`absolute ${group.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                  style={{ insetInlineStart: '1rem', insetBlockStart: '1rem' }}
                >
                  {group.badge}
                </span>
                <div
                  className="absolute p-5"
                  style={{ insetInlineStart: 0, insetInlineEnd: 0, insetBlockEnd: 0 }}
                >
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
const SizeGuideBanner = ({ config = {} }) => {
  const [activeSize, setActiveSize] = useState('M')
  
  // Use sizes from config if available, otherwise fall back to defaults
  const defaultSizes = [
    { size: 'XS', chest: '32"', waist: '26"', hip: '34"', length: '44"' },
    { size: 'S', chest: '34"', waist: '28"', hip: '36"', length: '44"' },
    { size: 'M', chest: '36"', waist: '30"', hip: '38"', length: '46"' },
    { size: 'L', chest: '38"', waist: '32"', hip: '40"', length: '46"' },
    { size: 'XL', chest: '40"', waist: '34"', hip: '42"', length: '48"' },
    { size: 'XXL', chest: '42"', waist: '36"', hip: '44"', length: '48"' },
    { size: 'XXXL', chest: '44"', waist: '38"', hip: '46"', length: '50"' },
    { size: 'Free Size', chest: '36–42"', waist: '30–36"', hip: '38–44"', length: '46"' },
  ]
  
  const sizes = config.sizes && Array.isArray(config.sizes) && config.sizes.length > 0 ? config.sizes : defaultSizes
  const currentSizeData = sizes.find(s => s.size === activeSize) || sizes[2] || defaultSizes[2]
  const { tag = 'Size Guide', title = 'Find Your Perfect Fit', description = 'All our kurtis are available in XS to XXXL and Free Size', note = '* Measurements are in inches · Sizes may vary slightly by style · Standard Indian Fitting', image } = config

  return (
    <section className="py-14 bg-transparent overflow-hidden">
      <div className="page-container">
        <SectionTitle tag={tag} title={title} description={description} />
        
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
                src={image?.url || sizeGuideImg} 
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
                <div
                className="absolute p-4 opacity-10"
                style={{ insetBlockStart: 0, insetInlineEnd: 0 }}
              >
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
          {note}
        </p>
      </div>
    </section>
  )
}

/* ─── Product Section ────────────────────────────────────────── */
const ProductSection = ({ tag, title, description, products, link, loading }) => (
    <section className="py-14 bg-transparent">
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
          <div className="flex md:grid overflow-x-auto no-scrollbar scroll-touch md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 -mx-4 px-4 md:mx-0 md:px-0">
            {products.slice(0, 8).map((product) => (
              <div
                key={product._id}
                className="w-[180px] sm:w-[220px] md:w-auto flex-shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
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

/* ─── Promo Banners ──────────────────────────────────────────── */

const PromoBanners = ({ customBanners = [] }) => {
  const defaultPromos = [
    {
      img: img1,
      tag: 'New Arrivals', tagColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
      title: 'Anarkali\nKurtis', cta: 'Shop Now',
      ctaColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-yellow-500/20',
      link: '/products?hasDiscount=true',
    },
    {
      img: img5,
      tag: 'Limited Time', tagColor: 'text-pink-400 border-pink-500/30 bg-pink-500/5',
      title: 'Flat 50% OFF\nPrinted Kurtis', cta: 'Grab Deal',
      ctaColor: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-pink-500/20',
      link: '/products?hasDiscount=true',
    },
    {
      img: img3,
      tag: 'Festival Special', tagColor: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
      title: 'Embroidered\nKurtis', cta: 'Explore',
      ctaColor: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-purple-500/20',
      link: '/products?hasDiscount=true',
    },
    {
      img: img4,
      tag: 'New Arrivals', tagColor: 'text-green-400 border-green-500/30 bg-green-500/5',
      title: 'new\ntrend', cta: 'New Add On',
      ctaColor: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-green-500/20',
      link: '/products?hasDiscount=true',
    },
  ];

  const promoPresets = [
    {
      tagColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
      ctaColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-yellow-500/20',
    },
    {
      tagColor: 'text-pink-400 border-pink-500/30 bg-pink-500/5',
      ctaColor: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-pink-500/20',
    },
    {
      tagColor: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
      ctaColor: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-purple-500/20',
    },
    {
      tagColor: 'text-green-400 border-green-500/30 bg-green-500/5',
      ctaColor: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-green-500/20',
    },
    {
      tagColor: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
      ctaColor: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/20',
    }
  ];

  const { categories } = useSelector((state) => state.categories)

  const promos = (customBanners && customBanners.length > 0)
    ? customBanners.map((cust, idx) => {
        const def = defaultPromos[idx % defaultPromos.length];
        const preset = promoPresets[idx % promoPresets.length];
        let customImg = def.img;
        if (cust.img) {
          customImg = typeof cust.img === 'string' ? cust.img : (cust.img.url || def.img);
        }
        return {
          img: customImg,
          tag: cust.tag || 'New Arrivals',
          tagColor: preset.tagColor,
          title: cust.title ? cust.title.replace(/\\n/g, '\n') : 'Premium\nKurtis',
          cta: cust.cta || 'Shop Now',
          ctaColor: preset.ctaColor,
          link: resolveBannerLink(cust, def, categories)
        };
      })
    : defaultPromos;

  return (
    <section className="py-12 bg-transparent">
      <div className="page-container">
        <HorizontalScrollRow itemCount={promos.length} ariaLabel="promotional kurti collections">
            {promos.map((b, i) => (
              <ScrollCard
                key={i}
                className="relative overflow-hidden rounded-3xl h-64 cursor-pointer group shadow-lg border border-gray-100/50 hover:border-white/20 md:hover:-translate-y-1.5 w-[min(82vw,300px)] sm:w-[min(42vw,320px)] md:w-[min(32vw,340px)] lg:w-[min(28vw,360px)]"
              >
                <Link to={b.link} className="block w-full h-full relative">
                  {/* Deep Zoom Image Background */}
                  <img 
                    src={b.img} 
                    alt={b.title} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top md:group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Rich Luxury Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                  
                  {/* Floating Banner Contents */}
                  <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
                    <span className={`inline-block w-fit px-3 py-1 rounded-full border text-[10px] font-extrabold tracking-[0.2em] uppercase mb-3 ${b.tagColor}`}>
                      {b.tag}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-white mb-5 leading-tight tracking-wide whitespace-pre-line drop-shadow-sm group-hover:text-gray-100 transition-colors">
                      {b.title}
                    </h3>
                    <span 
                      className={`inline-flex items-center gap-2 ${b.ctaColor} text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-2xl w-fit transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-[1.03] active:scale-[0.98]`}
                    >
                      {b.cta} <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </ScrollCard>
            ))}
        </HorizontalScrollRow>
      </div>
    </section>
  )
}

/* ─── Testimonials ───────────────────────────────────────────── */
const TestimonialsSection = ({ reviews = [], section = {} }) => {
  const defaultReviews = [
    { name: 'Priya Sharma', city: 'Chennai', rating: 5, text: 'The Anarkali kurti fits perfectly! The fabric is so soft and the embroidery is stunning. Will definitely order again.', product: 'Floral Anarkali Kurti', avatar: 'P' },
    { name: 'Meera Patel', city: 'Mumbai', rating: 5, text: 'Fast delivery and beautiful packaging. The printed kurti looks even better in person!', product: 'Block Print Straight Kurti', avatar: 'M' },
    { name: 'Ananya Reddy', city: 'Hyderabad', rating: 5, text: 'Perfect fit and gorgeous design. Got so many compliments at the festival!', product: 'Embroidered A-Line Kurti', avatar: 'A' },
  ]
  const fromDb = (reviews || []).filter((r) => r.isActive !== false && r.name && r.text)
  const activeReviews = fromDb.length ? fromDb : defaultReviews
  const tag = section?.tag || 'Customer Love'
  const title = section?.title || 'What Our Customers Say'
  const description = section?.description

  return (
    <section className="py-14 bg-transparent">
      <div className="page-container">
        <SectionTitle tag={tag} title={title} description={description} />
        <div className={`grid gap-6 ${
          activeReviews.length === 1
            ? 'grid-cols-1 max-w-lg mx-auto'
            : activeReviews.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {activeReviews.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(Math.min(5, Math.max(0, r.rating || 5)))].map((_, j) => (
                  <FiStar key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 italic">"{r.text}"</p>
              <div className="flex items-center gap-3">
                {r.photo?.url ? (
                  <img src={r.photo.url} alt={r.name} className="w-10 h-10 rounded-full object-cover border-2 border-yellow-100" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-white font-bold text-sm">{r.avatar || r.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-gray-800 font-semibold text-sm">{r.name}</p>
                  <p className="text-gray-400 text-xs truncate">
                    {[r.city, r.product].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Video Section ─────────────────────────────────────────────── */
const VideoSection = ({ config = {} }) => {
  const { badge = 'Featured Video', title = 'A Glimpse Of Our Craft', description = 'Experience the meticulous attention to detail and hand-crafted precision that goes into every single kurti we create. From selecting the finest fabrics to the final intricate stitches, our artisans pour their heart into delivering timeless elegance you can wear.', videoUrl = '', video = {} } = config
  
  // Prioritize uploaded video over URL input, then fallback to sample video
  const videoSrc = video?.url || videoUrl || sampleVideo

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="page-container flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 flex flex-col md:flex-row"
        >
          {/* Left Side: Video Container */}
          <div className="relative w-full md:w-1/2 lg:w-3/5 bg-black flex-shrink-0">
            <video 
              className="w-full h-full object-cover aspect-video md:aspect-auto md:absolute md:inset-0"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              controls
            />
          </div>

          {/* Right Side: Text Content */}
          <div className="w-full md:w-1/2 lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-left bg-white">
            <div className="mb-6">
              <span className="inline-block bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-yellow-200/50">
                {badge}
              </span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-wide leading-tight whitespace-pre-line">
              {title}
            </h2>
            
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              {description}
            </p>
            
            <div className="mt-8 flex items-center gap-4">
               <div className="w-12 h-[2px] bg-yellow-400"></div>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Handcrafted Perfection</span>
            </div>
          </div>
        </motion.div>
      </div>
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

      <div className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-3 no-scrollbar scroll-touch">
        {categoryCoupons.map((coupon) => {
          const category = coupon.applicableCategories[0];
          if (!category) return null;
          
          return (
            <div
              key={coupon._id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-yellow-100/50 flex-shrink-0 w-80 relative overflow-hidden"
            >
              {/* Gold/Yellow Glow corner badge */}
              <div
                className="absolute bg-yellow-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-bl-2xl"
                style={{ insetBlockStart: 0, insetInlineEnd: 0 }}
              >
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
            </div>
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
    let rafId = null
    let lastProgress = -1

    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const el = containerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const windowHeight = window.innerHeight
        if (rect.top >= windowHeight || rect.bottom <= 0) return

        const entryPoint = rect.top - windowHeight
        const totalDistance = windowHeight * 0.85
        const progress = Math.round(Math.min(Math.max(-entryPoint / totalDistance, 0), 1) * 100)
        if (progress === lastProgress) return
        lastProgress = progress
        setStitchProgress(progress)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full py-6 overflow-hidden bg-transparent select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-6 flex items-center">
        {/* Fabric Crease Guide (Soft Shadow Line) */}
        <div
          className="absolute h-[1px] bg-yellow-800/10"
          style={{ insetInlineStart: '1rem', insetInlineEnd: '1rem' }}
        />

        {/* Dotted Guide Punch Holes */}
        <div
          className="absolute h-[2px] border-t border-dotted border-yellow-800/20"
          style={{ insetInlineStart: '1rem', insetInlineEnd: '1rem' }}
        />

        {/* Dynamic Glowing Gold Stitch */}
        <div 
          className="absolute h-0 border-t-2 border-dashed border-yellow-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(217,119,6,0.15)]"
          style={{ width: `calc(${stitchProgress}% - 28px)`, insetInlineStart: '1rem' }}
        />

        {/* Sewing Needle & trailing thread sliding dynamically with scroll */}
        <div 
          className="absolute transition-all duration-75 ease-out flex items-center"
          style={{ 
            insetInlineStart: `calc(16px + ${stitchProgress}%)`, 
            transform: 'translateY(-50%)', 
            insetBlockStart: '50%',
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
  const [promosLoading, setPromosLoading] = useState(true)
  const [homeConfig, setHomeConfig] = useState(null)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchCategories())

    api.get('/coupons/active')
      .then(({ data }) => {
        setActivePromos(data.coupons || [])
        setPromosLoading(false)
      })
      .catch(err => {
        console.error('Failed to load active category promos', err)
        setPromosLoading(false)
      })

    const fetchSettings = () => {
      api.get('/settings')
        .then(({ data }) => setHomeConfig(data.settings))
        .catch(() => {})
    }

    fetchSettings()
    const refreshInterval = setInterval(fetchSettings, 60000)
    return () => clearInterval(refreshInterval)
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
        loading={promosLoading}
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

      {/* 5. Promotional Banners */}
      <PromoBanners customBanners={homeConfig?.promoBanners} />

      {/* 6. New Arrivals */}
      <ProductSection
        tag="✨ Just In"
        title="New Kurti Arrivals"
        description="Fresh designs added every week"
        products={featured?.newArrivals}
        link="/products?isNewArrival=true"
        loading={loading && !featured}
      />

      {/* 7. Shop By Occasion */}
      <ShopByOccasion customBanners={homeConfig?.occasionBanners} />

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
      <section className="py-1
      4 bg-transparent">
        <div className="page-container">
          <SectionTitle tag="All Collections" title="Browse All Kurti Types" description="From casual cotton to festive embroidered — we have every kurti you need" />
          <CategoryGrid />
        </div>
      </section>

      {/* 10. Size Guide */}
      <SizeGuideBanner config={homeConfig?.sizeGuide} />

      {/* 11. Testimonials */}
      <TestimonialsSection reviews={homeConfig?.testimonials} section={homeConfig?.testimonialsSection} />

      {/* 12. Video Section */}
      <VideoSection config={homeConfig?.videoSection} />

    </>
  )
}

export default HomePage

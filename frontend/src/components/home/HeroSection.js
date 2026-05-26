import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import api from '../../utils/api'

// ── All 5 local kurti images ─────────────────────────────────
import img1 from '../../assets/091A6888.webp'
import img2 from '../../assets/091A7701.webp'
import img3 from '../../assets/091A7713.webp'
import img4 from '../../assets/NIJU9620.webp'
import img5 from '../../assets/NIJU9633.webp'

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    image: img1,
    subtitle: 'Summer Kurti Collection 2026',
    title: 'Explore Trendy',
    highlight: 'Kurti Collections',
    badge: 'Flat 50% OFF',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    id: 'default-2',
    image: img2,
    subtitle: 'Flared & Embroidered — New Arrivals',
    title: 'Beautiful',
    highlight: 'Anarkali Kurtis',
    badge: 'New Arrivals',
    cta: 'Explore Now',
    link: '/category/anarkali-kurtis',
  },
  {
    id: 'default-3',
    image: img3,
    subtitle: 'Block Print · Casual · Office Wear',
    title: 'Printed &',
    highlight: 'Designer Kurtis',
    badge: 'Best Sellers',
    cta: 'Discover',
    link: '/category/printed-kurtis',
  },
  {
    id: 'default-4',
    image: img4,
    subtitle: 'Comfortable & Graceful Styles',
    title: 'Everyday',
    highlight: 'Casual Kurtis',
    badge: 'Trending Now',
    cta: 'Shop Casual',
    link: '/category/casual-kurtis',
  },
  {
    id: 'default-5',
    image: img5,
    subtitle: 'Festive & Party Collections',
    title: 'Glamorous',
    highlight: 'Party Kurtis',
    badge: 'Festival Special',
    cta: 'Shop Party Wear',
    link: '/category/party-wear-kurtis',
  },
]

const HeroSection = () => {
  const [dbSlides, setDbSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/hero-slides')
      .then(({ data }) => {
        if (data.slides && data.slides.length > 0) {
          setDbSlides(data.slides)
        }
      })
      .catch((err) => console.log('Using default static slider banners:', err.message))
      .finally(() => setLoading(false))
  }, [])

  const slides = dbSlides.length > 0 ? dbSlides.map(s => {
    // Generate link based on categoryId
    const link = s.categoryId?.slug ? `/category/${s.categoryId.slug}` : (s.categoryId?._id ? `/products?category=${s.categoryId._id}` : '/products')
    return {
      id: s._id,
      image: s.image?.url || img1,
      subtitle: s.subtitle,
      title: s.title,
      highlight: s.highlight,
      badge: s.badge,
      cta: s.cta || 'Shop Now',
      link,
      textPosition: s.textPosition || 'center'
    }
  }) : DEFAULT_SLIDES

  // Reset index if slides list changes (e.g. database banners loaded) to prevent out of bounds
  useEffect(() => {
    setCurrent(0)
  }, [slides.length])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, paused])

  const slide = slides[current] || slides[0] || DEFAULT_SLIDES[0]

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  const hasOverlay = slide.title || slide.highlight || slide.badge || slide.subtitle || slide.cta

  if (loading) {
    return (
      <div
        className="w-full overflow-hidden aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.2/1] lg:aspect-[2.4/1] bg-[#111111] flex items-center justify-center relative select-none"
        style={{ minBlockSize: '340px', maxBlockSize: '550px' }}
      >
        {/* Dynamic pulsing shimmer backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 animate-pulse opacity-85" />
        
        {/* Luxury Gold styled placeholder content */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center px-4">
          <div className="h-6 w-32 bg-yellow-500/10 border border-yellow-500/20 rounded-full animate-pulse" />
          <div className="h-10 w-64 bg-neutral-800/60 rounded-2xl animate-pulse" />
          <div className="h-4 w-44 bg-neutral-800/40 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <section
      className="relative w-full overflow-hidden aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.2/1] lg:aspect-[2.4/1]"
      style={{ minBlockSize: '340px', maxBlockSize: '550px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ── */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 group/slide"
        >
          <Link to={slide.link} className="absolute inset-0 z-10 cursor-pointer block">
            {/* Blurred dynamic backing layer (gently covers all sides of irregular ratios) */}
            <div className="absolute inset-0 bg-black overflow-hidden select-none pointer-events-none">
              <img
                src={slide.image}
                alt=""
                className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
              />
            </div>

            {/* Sharp Foreground image */}
            <img
              src={slide.image}
              alt={slide.title || 'Kurti Elegance Banner'}
              className="w-full h-full object-cover object-center relative z-10 transition-transform duration-[6000ms] ease-out group-hover/slide:scale-105"
            />
            {/* gradient overlay — bottom heavy so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10 z-10" />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* ── Text position alignments (Left / Center / Right) ── */}
      {hasOverlay && (() => {
        const outerCls = slide.textPosition === 'left'
          ? "absolute inset-0 flex flex-col items-start justify-center text-left z-20 px-6 md:px-24 pointer-events-none"
          : slide.textPosition === 'right'
          ? "absolute inset-0 flex flex-col items-end justify-center text-right z-20 px-6 md:px-24 pointer-events-none"
          : "absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4 pointer-events-none";

        const innerCls = slide.textPosition === 'left'
          ? "flex flex-col items-start max-w-2xl"
          : slide.textPosition === 'right'
          ? "flex flex-col items-end max-w-2xl"
          : "flex flex-col items-center max-w-3xl";

        return (
          <div className={outerCls}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={innerCls}
              >
                {/* Badge pill */}
                {slide.badge && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="inline-flex items-center gap-2 bg-yellow-500/90 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 shadow-lg pointer-events-auto"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {slide.badge}
                  </motion.span>
                )}

                {/* Subtitle */}
                {slide.subtitle && (
                  <p className="text-white/70 text-sm md:text-base font-light tracking-widest uppercase mb-2">
                    {slide.subtitle}
                  </p>
                )}

                {/* Title */}
                {slide.title && (
                  <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg mb-1">
                    {slide.title}
                  </h1>
                )}
                {slide.highlight && (
                  <h1
                    className="font-display text-3xl sm:text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg mb-8"
                    style={{ color: '#D4AF37' }}
                  >
                    {slide.highlight}
                  </h1>
                )}

                {/* CTA */}
                {slide.cta && (
                  <Link to={slide.link} className="pointer-events-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-10 py-3.5 text-white font-bold text-sm tracking-widest uppercase shadow-xl transition-all"
                      style={{ backgroundColor: '#D4AF37', letterSpacing: '0.15em' }}
                    >
                      {slide.cta}
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })()}

      {/* ── Left Arrow ── */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 hover:border-white/50 transition-all backdrop-blur-sm"
        aria-label="Previous"
      >
        <FiChevronLeft size={22} />
      </button>

      {/* ── Right Arrow ── */}
      <button
        onClick={next}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 hover:border-white/50 transition-all backdrop-blur-sm"
        aria-label="Next"
      >
        <FiChevronRight size={22} />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
            className={`transition-all duration-300 rounded-full ${i === current
                ? 'w-8 h-2.5 bg-yellow-400'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-6 right-6 z-20 text-white/40 text-sm font-light tabular-nums">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </section>
  )
}

export default HeroSection

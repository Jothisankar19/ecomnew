import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// ── All 5 local kurti images ─────────────────────────────────
import img1 from '../../assets/091A6888.webp'
import img2 from '../../assets/091A7701.webp'
import img3 from '../../assets/091A7713.webp'
import img4 from '../../assets/NIJU9620.webp'
import img5 from '../../assets/NIJU9633.webp'

const slides = [
  {
    id: 1,
    image: img1,
    subtitle: 'Summer Kurti Collection 2026',
    title: 'Explore Trendy',
    highlight: 'Kurti Collections',
    badge: 'Flat 50% OFF',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    id: 2,
    image: img2,
    subtitle: 'Flared & Embroidered — New Arrivals',
    title: 'Beautiful',
    highlight: 'Anarkali Kurtis',
    badge: 'New Arrivals',
    cta: 'Explore Now',
    link: '/category/anarkali-kurtis',
  },
  {
    id: 3,
    image: img3,
    subtitle: 'Block Print · Casual · Office Wear',
    title: 'Printed &',
    highlight: 'Designer Kurtis',
    badge: 'Best Sellers',
    cta: 'Discover',
    link: '/category/printed-kurtis',
  },
  {
    id: 4,
    image: img4,
    subtitle: 'Comfortable & Graceful Styles',
    title: 'Everyday',
    highlight: 'Casual Kurtis',
    badge: 'Trending Now',
    cta: 'Shop Casual',
    link: '/category/casual-kurtis',
  },
  {
    id: 5,
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
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, paused])

  const slide = slides[current]

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <section
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden"
      style={{ minHeight: '380px' }}
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
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* gradient overlay — bottom heavy so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Centered text ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center max-w-3xl"
          >
            {/* Badge pill */}
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="inline-flex items-center gap-2 bg-yellow-500/90 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 shadow-lg"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {slide.badge}
            </motion.span>

            {/* Subtitle */}
            <p className="text-white/70 text-sm md:text-base font-light tracking-widest uppercase mb-2">
              {slide.subtitle}
            </p>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg mb-1">
              {slide.title}
            </h1>
            <h1
              className="font-display text-3xl sm:text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg mb-8"
              style={{ color: '#D4AF37' }}
            >
              {slide.highlight}
            </h1>

            {/* CTA */}
            <Link to={slide.link}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-3.5 text-white font-bold text-sm tracking-widest uppercase shadow-xl transition-all"
                style={{ backgroundColor: '#D4AF37', letterSpacing: '0.15em' }}
              >
                {slide.cta}
              </motion.button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

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

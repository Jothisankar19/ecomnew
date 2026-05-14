import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi'
import { fetchFeaturedProducts } from '../store/slices/productSlice'
import { fetchCategories } from '../store/slices/categorySlice'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import HeroSection from '../components/home/HeroSection'
import CategoryGrid from '../components/home/CategoryGrid'
import Seo from '../components/ui/Seo'

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
    <section className="py-6 md:py-10 border-b border-gray-100 bg-white">
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

/* ─── Promotional Sale Banner ────────────────────────────────── */
const SaleBanner = () => (
  <section className="py-8 bg-white">
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl shadow-xl mx-auto"
        style={{ maxWidth: '680px', height: '240px' }}
      >
        {/* Full image — sets the natural height of the banner */}
        <img
          src={img4}
          alt="Sale Banner"
          className="w-full h-full block"
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />

        {/* Dark overlay — stronger on right for text readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />

        {/* Text — right aligned */}
        <div className="absolute inset-0 flex items-center justify-end px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-right max-w-xs"
          >
            <p className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-2">
              Limited Time Offer
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-1">
              MOTHER'S DAY
            </h2>
            <h2
              className="font-display text-4xl md:text-5xl font-bold leading-tight mb-3"
              style={{ color: '#D4AF37', fontStyle: 'italic' }}
            >
              Sale
            </h2>
            <div className="flex items-baseline gap-2 justify-end mb-5">
              <span className="text-white/70 text-sm font-medium">UPTO</span>
              <span className="text-white font-black text-4xl md:text-5xl tracking-tight">65% OFF</span>
            </div>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 border border-white/60 hover:bg-white hover:text-gray-900 text-white text-xs font-bold tracking-widest uppercase px-6 py-2.5 transition-all"
              >
                EXPLORE <span className="text-yellow-400">›</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
)

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
    <section className="py-14 bg-white">
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
              <Link to={`/category/${type.slug}`} className="block group text-center">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-3 shadow-sm border border-gray-100 group-hover:border-yellow-300 transition-all">
                  <img
                    src={type.img}
                    alt={type.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <p className="text-white font-bold text-sm drop-shadow">{type.name}</p>
                    <p className="text-white/70 text-xs">{type.desc}</p>
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
    <section className="py-14 bg-gray-50">
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
    <section className="py-14 bg-white overflow-hidden">
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
    <section ref={ref} className="py-14 bg-white">
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
  <section className="py-10 bg-gray-50">
    <div className="page-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=600&q=85',
            tag: 'New Arrivals', tagColor: 'text-yellow-300',
            title: 'Anarkali\nKurtis', cta: 'Shop Now',
            ctaColor: 'bg-yellow-500 hover:bg-yellow-400',
            link: '/category/anarkali-kurtis',
          },
          {
            img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85',
            tag: 'Limited Time', tagColor: 'text-pink-300',
            title: 'Flat 50% OFF\nPrinted Kurtis', cta: 'Grab Deal',
            ctaColor: 'bg-pink-500 hover:bg-pink-400',
            link: '/category/printed-kurtis',
          },
          {
            img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=85',
            tag: 'Festival Special', tagColor: 'text-purple-300',
            title: 'Embroidered\nKurtis', cta: 'Explore',
            ctaColor: 'bg-purple-500 hover:bg-purple-400',
            link: '/category/embroidered-kurtis',
          },
        ].map((b, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl h-56 cursor-pointer group shadow-md"
          >
            <img src={b.img} alt={b.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6">
              <span className={`${b.tagColor} text-xs font-bold tracking-widest uppercase mb-2`}>{b.tag}</span>
              <h3 className="font-display text-2xl font-bold text-white mb-3 leading-tight whitespace-pre-line">{b.title}</h3>
              <Link to={b.link} className={`inline-flex items-center gap-1.5 ${b.ctaColor} text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-sm w-fit transition-colors`}>
                {b.cta} <FiArrowRight size={12} />
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
    <section className="py-14 bg-gradient-to-b from-yellow-50/60 to-white">
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

/* ─── CTA Banner ─────────────────────────────────────────────── */
const CTASection = () => (
  <section className="py-14 bg-white">
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl group"
      >
        <div className="absolute inset-0 bg-gray-900" />
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&q=85"
          alt="Kurti Collection"
          className="w-full h-[450px] md:h-[400px] object-cover object-top opacity-60 md:opacity-100 group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-8 md:px-20 pb-12 md:pb-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl"
          >
            <span className="inline-block text-yellow-400 text-xs font-black tracking-[0.2em] uppercase mb-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              Summer 2026
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-[1.1]">
              Summer Kurti<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Collection 2026
              </span>
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              Discover breathtaking kurtis crafted for the modern Indian woman. 
              <span className="block text-yellow-400 font-bold mt-1">Flat 50% OFF on all styles.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl transition-all shadow-xl shadow-yellow-500/20 active:scale-95"
              >
                Shop All Kurtis 
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
              <Link
                to="/category/anarkali-kurtis"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white hover:bg-white/10 text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl transition-all backdrop-blur-sm"
              >
                Anarkali Kurtis
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 hidden lg:block">
           <div className="w-24 h-24 border-2 border-yellow-500/30 rounded-full animate-spin-slow flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-white/10 rounded-full" />
           </div>
        </div>
      </motion.div>
    </div>
  </section>
)

/* ─── HomePage ───────────────────────────────────────────────── */
const HomePage = () => {
  const dispatch = useDispatch()
  const { featured, loading } = useSelector((state) => state.products)
  const { categories } = useSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchCategories())
  }, [dispatch])

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
      <SaleBanner />

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

      {/* 9. All Kurti Categories */}
      <section className="py-14 bg-gray-50">
        <div className="page-container">
          <SectionTitle tag="All Collections" title="Browse All Kurti Types" description="From casual cotton to festive embroidered — we have every kurti you need" />
          <CategoryGrid />
        </div>
      </section>

      {/* 10. Size Guide */}
      <SizeGuideBanner />

      {/* 11. Testimonials */}
      <TestimonialsSection />

      {/* 12. CTA */}
      <CTASection />
    </>
  )
}

export default HomePage

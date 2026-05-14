import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

// ── Your local kurti images from assets ─────────────────────
import img1 from '../../assets/091A6888.webp'
import img2 from '../../assets/091A7701.webp'
import img3 from '../../assets/091A7713.webp'
import img4 from '../../assets/NIJU9620.webp'
import img5 from '../../assets/NIJU9633.webp'

export const KURTI_CATEGORIES = [
  // By Type — use your 5 images cycling through
  {
    name: 'Anarkali Kurtis', slug: 'anarkali-kurtis', count: '60+ styles', group: 'By Type',
    desc: 'Flared & Elegant', img: img1, bg: 'from-purple-50 to-pink-50',
  },
  {
    name: 'A-Line Kurtis', slug: 'a-line-kurtis', count: '80+ styles', group: 'By Type',
    desc: 'Slim & Flattering', img: img2, bg: 'from-blue-50 to-cyan-50',
  },
  {
    name: 'Straight Kurtis', slug: 'straight-kurtis', count: '90+ styles', group: 'By Type',
    desc: 'Classic & Versatile', img: img3, bg: 'from-teal-50 to-green-50',
  },
  {
    name: 'Flared Kurtis', slug: 'flared-kurtis', count: '50+ styles', group: 'By Type',
    desc: 'Free & Flowy', img: img4, bg: 'from-yellow-50 to-amber-50',
  },
  {
    name: 'Asymmetric Kurtis', slug: 'asymmetric-kurtis', count: '40+ styles', group: 'By Type',
    desc: 'Modern & Edgy', img: img5, bg: 'from-rose-50 to-pink-50',
  },
  {
    name: 'Kaftan Kurtis', slug: 'kaftan-kurtis', count: '35+ styles', group: 'By Type',
    desc: 'Flowy & Comfortable', img: img1, bg: 'from-sky-50 to-blue-50',
  },
  // By Design
  {
    name: 'Printed Kurtis', slug: 'printed-kurtis', count: '150+ styles', group: 'By Design',
    desc: 'Bold & Vibrant', img: img2, bg: 'from-yellow-50 to-orange-50',
  },
  {
    name: 'Embroidered Kurtis', slug: 'embroidered-kurtis', count: '70+ styles', group: 'By Design',
    desc: 'Intricate & Festive', img: img3, bg: 'from-pink-50 to-rose-50',
  },
  {
    name: 'Plain Kurtis', slug: 'plain-kurtis', count: '60+ styles', group: 'By Design',
    desc: 'Minimal & Clean', img: img4, bg: 'from-gray-50 to-slate-50',
  },
  {
    name: 'Block Print Kurtis', slug: 'block-print-kurtis', count: '45+ styles', group: 'By Design',
    desc: 'Handcrafted & Artsy', img: img5, bg: 'from-amber-50 to-yellow-50',
  },
  // By Occasion
  {
    name: 'Casual Kurtis', slug: 'casual-kurtis', count: '120+ styles', group: 'By Occasion',
    desc: 'Everyday Comfort', img: img1, bg: 'from-lime-50 to-green-50',
  },
  {
    name: 'Office Kurtis', slug: 'office-kurtis', count: '70+ styles', group: 'By Occasion',
    desc: 'Professional & Smart', img: img2, bg: 'from-slate-50 to-gray-50',
  },
  {
    name: 'Party Wear Kurtis', slug: 'party-wear-kurtis', count: '80+ styles', group: 'By Occasion',
    desc: 'Glamorous & Chic', img: img3, bg: 'from-fuchsia-50 to-pink-50',
  },
  {
    name: 'Festival Kurtis', slug: 'festival-kurtis', count: '55+ styles', group: 'By Occasion',
    desc: 'Vibrant & Celebratory', img: img4, bg: 'from-orange-50 to-red-50',
  },
  // By Age
  {
    name: "Women's Kurtis", slug: 'womens-kurtis', count: '300+ styles', group: 'By Age',
    desc: '18 – 45 yrs', img: img5, bg: 'from-rose-50 to-pink-50',
  },
  {
    name: "Girls' Kurtis", slug: 'girls-kurtis', count: '80+ styles', group: 'By Age',
    desc: '8 – 17 yrs', img: img1, bg: 'from-sky-50 to-blue-50',
  },
]

const CategoryCard = ({ cat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className="cursor-pointer"
  >
    <Link to={`/category/${cat.slug}`} className="block group">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.bg} border border-white shadow-sm group-hover:shadow-lg transition-all duration-300`}>
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={cat.img}
            alt={`${cat.name} - women wearing kurti`}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
          <p className="text-white font-bold text-sm leading-tight drop-shadow-md">{cat.name}</p>
          <p className="text-white/80 text-xs mt-0.5 drop-shadow">{cat.desc}</p>
        </div>
      </div>
      <p className="text-center text-gray-400 text-xs mt-2">{cat.count}</p>
    </Link>
  </motion.div>
)

const CategoryGrid = () => {
  const { categories: dynamicCategories } = useSelector((state) => state.categories)
  
  const gradients = [
    'from-purple-50 to-pink-50',
    'from-blue-50 to-cyan-50',
    'from-teal-50 to-green-50',
    'from-yellow-50 to-amber-50',
    'from-rose-50 to-pink-50',
    'from-sky-50 to-blue-50'
  ]

  const mappedCategories = dynamicCategories?.length > 0 
    ? dynamicCategories.map((cat, i) => ({
        name: cat.name,
        slug: cat.slug,
        desc: cat.description || 'Premium Collection',
        img: cat.image?.url || img1,
        bg: gradients[i % gradients.length],
        group: 'All Collections',
        count: ''
      }))
    : KURTI_CATEGORIES

  const groups = [...new Set(mappedCategories.map(c => c.group))]

  return (
    <div className="space-y-12">
      {groups.map((group) => {
        const items = mappedCategories.filter(c => c.group === group)
        return (
          <div key={group}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-0.5 bg-yellow-400 rounded-full inline-block" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{group}</h3>
            </div>
            <div className={`grid gap-4 ${
              items.length <= 4
                ? 'grid-cols-2 sm:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
            }`}>
              {items.map((cat, i) => (
                <CategoryCard key={cat.slug} cat={cat} index={i} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CategoryGrid

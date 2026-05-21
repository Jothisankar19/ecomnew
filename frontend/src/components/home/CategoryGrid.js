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

const KURTI_CATEGORIES = [
  {
    name: 'Anarkali Kurtis',
    slug: 'anarkali-kurtis',
    desc: 'Regal & Flowing',
    img: img2,
    bg: 'from-pink-100 to-rose-50',
    group: 'Premium',
    count: '24+ Styles'
  },
  {
    name: 'A-Line Kurtis',
    slug: 'a-line-kurtis',
    desc: 'Classic Everyday',
    img: img1,
    bg: 'from-blue-100 to-sky-50',
    group: 'Everyday',
    count: '45+ Styles'
  },
  {
    name: 'Straight Kurtis',
    slug: 'straight-kurtis',
    desc: 'Office & Casual',
    img: img3,
    bg: 'from-amber-100 to-yellow-50',
    group: 'Workwear',
    count: '30+ Styles'
  },
  {
    name: 'Printed Kurtis',
    slug: 'printed-kurtis',
    desc: 'Vibrant Patterns',
    img: img2,
    bg: 'from-emerald-100 to-teal-50',
    group: 'Casual',
    count: '50+ Styles'
  },
  {
    name: 'Embroidered',
    slug: 'embroidered-kurtis',
    desc: 'Intricate Details',
    img: img1,
    bg: 'from-purple-100 to-fuchsia-50',
    group: 'Premium',
    count: '15+ Styles'
  },
  {
    name: 'Party Wear',
    slug: 'party-wear-kurtis',
    desc: 'Festive Ready',
    img: img3,
    bg: 'from-rose-100 to-red-50',
    group: 'Occasion',
    count: '20+ Styles'
  }
];

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
        group: i % 2 === 0 ? 'Premium' : 'Everyday',
        count: ''
      }))
    : KURTI_CATEGORIES;

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

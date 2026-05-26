import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../store/slices/categorySlice';
import { motion } from 'framer-motion';
import Seo from '../components/ui/Seo';

// ── Local kurti images (fallback) ─────────────────────────────
import img1 from '../assets/091A6888.webp';
import img2 from '../assets/091A7701.webp';
import img3 from '../assets/091A7713.webp';
import img4 from '../assets/NIJU9620.webp';
import img5 from '../assets/NIJU9633.webp';

const fallbackImages = [img1, img2, img3, img4, img5];

const gradients = [
  'from-pink-100 to-rose-50',
  'from-blue-100 to-sky-50',
  'from-amber-100 to-yellow-50',
  'from-emerald-100 to-teal-50',
  'from-purple-100 to-fuchsia-50',
  'from-rose-100 to-red-50',
  'from-sky-100 to-cyan-50',
  'from-lime-100 to-green-50',
];

/* ── Category Card (same design as home page) ────────────────── */
const CategoryCard = ({ cat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className="cursor-pointer"
  >
    <Link to={`/category/${cat.slug}`} className="block group">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.bg} border border-white shadow-sm group-hover:shadow-xl transition-all duration-300`}>
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={cat.img}
            alt={`${cat.name} collection`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <p className="text-white font-bold text-sm leading-tight drop-shadow-md">{cat.name}</p>
          <p className="text-white/80 text-xs mt-1 drop-shadow">{cat.desc}</p>
        </div>
      </div>
      {cat.count && (
        <p className="text-center text-gray-400 text-xs mt-2">{cat.count}</p>
      )}
    </Link>
  </motion.div>
);

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Map API categories to the same structure as the home page cards
  const mappedCategories = categories?.length > 0
    ? categories.map((cat, i) => ({
        name: cat.name,
        slug: cat.slug,
        desc: cat.description || 'Premium Collection',
        img: typeof cat.image === 'string' ? cat.image : (cat.image?.url || fallbackImages[i % fallbackImages.length]),
        bg: gradients[i % gradients.length],
        count: '',
      }))
    : [];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kurtielegance.com/" },
      { "@type": "ListItem", "position": 2, "name": "Collections", "item": window.location.href }
    ]
  };

  return (
    <>
      <Seo
        title="All Collections"
        description="Browse all our premium kurti collections at Kurti Elegance. Find the perfect style for every occasion."
        schema={breadcrumbSchema}
      />

      <div className="pt-24 pb-20 min-h-screen">
        {/* Page Header */}
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full mb-4">
              Kurti Types
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Shop By Style
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Find your perfect kurti silhouette from our curated collections
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-100 border-t-yellow-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Loading collections...</p>
              </div>
            </div>
          ) : mappedCategories.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-gray-700 text-xl font-semibold mb-2">No collections found</h3>
              <p className="text-gray-400 mb-6">Please check back soon</p>
              <Link to="/products" className="btn-primary">Browse All Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {mappedCategories.map((cat, i) => (
                <CategoryCard key={cat.slug} cat={cat} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';
import { fetchProducts, setFilters } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { SkeletonGrid } from '../components/ui/SkeletonCard';
import Seo from '../components/ui/Seo';
import api from '../utils/api';

const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { products, total, pages, loading } = useSelector((state) => state.products);
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await api.get(`/categories/slug/${slug}`);
        setCategory(data.category);
        if (data.category) {
          dispatch(setFilters({ category: data.category._id }));
          dispatch(fetchProducts({ category: data.category._id, sort, page }));
        }
      } catch (err) {
        dispatch(fetchProducts({ categorySlug: slug, sort, page }));
      }
    };
    fetchCategory();
    window.scrollTo(0, 0);
  }, [slug, dispatch]);

  useEffect(() => {
    if (category) {
      dispatch(fetchProducts({ category: category._id, sort, page }));
    }
  }, [sort, page, category, dispatch]);

  const categoryName = category?.name || slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kurtielegance.com/" },
      { "@type": "ListItem", "position": 2, "name": "Collections", "item": "https://kurtielegance.com/categories" },
      { "@type": "ListItem", "position": 3, "name": categoryName, "item": window.location.href }
    ]
  };

  return (
    <>
      <Seo 
        title={categoryName}
        description={`Shop ${categoryName} collection at Ethnic Elegance. Premium quality ethnic wear.`}
        schema={breadcrumbSchema}
      />

      <div className="pt-24 min-h-screen">
        <div className="relative py-16 bg-gradient-to-br from-yellow-900/30 via-dark-800 to-dark-900 border-b border-white/10">
          <div className="page-container relative z-10">
            <Link to="/categories" className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors text-sm">
              <FiArrowLeft size={16} /> All Collections
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-2">{categoryName}</h1>
            <p className="text-white/50">{total} products in this collection</p>
          </div>
        </div>

        <div className="page-container py-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-white/40 text-sm">{total} products found</p>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-luxury text-sm py-2 pr-8 w-auto cursor-pointer"
            >
              <option value="newest" className="bg-dark-800">Newest First</option>
              <option value="price_asc" className="bg-dark-800">Price: Low to High</option>
              <option value="price_desc" className="bg-dark-800">Price: High to Low</option>
              <option value="rating" className="bg-dark-800">Top Rated</option>
              <option value="popular" className="bg-dark-800">Most Popular</option>
            </select>
          </div>

          {loading ? (
            <SkeletonGrid count={12} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
              <p className="text-white/40 mb-6">This category is coming soon</p>
              <Link to="/categories" className="btn-primary">Browse All Collections</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        p === page ? 'bg-yellow-500 text-black' : 'glass text-white/60 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;

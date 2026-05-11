import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiSearch } from 'react-icons/fi'
import { searchProducts } from '../store/slices/productSlice'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'

const SearchPage = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { searchResults, loading } = useSelector((state) => state.products)
  const [inputValue, setInputValue] = useState(query)

  useEffect(() => {
    if (query.trim()) dispatch(searchProducts(query))
    setInputValue(query)
  }, [query, dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() })
  }

  return (
    <>
      <Helmet><title>{query ? `"${query}" - Search` : 'Search'} - Kurti Elegance</title></Helmet>
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="page-container py-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for kurtis, anarkali, printed..."
              className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-32 py-4 text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:border-yellow-400 shadow-sm transition-all" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary text-sm py-2 px-5">
              Search
            </button>
          </form>

          {query && (
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-gray-800">
                {loading ? 'Searching...' : `${searchResults.length} results for "${query}"`}
              </h1>
            </div>
          )}

          {loading ? <SkeletonGrid count={8} />
            : !query ? (
              <div className="text-center py-20">
                <FiSearch className="text-gray-200 mx-auto mb-4" size={64} />
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-3">Search Our Kurtis</h2>
                <p className="text-gray-400">Find your perfect kurti style</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-gray-700 text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-400">Try different keywords like "anarkali", "printed", "cotton"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {searchResults.map((product, i) => (
                  <motion.div key={product._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
        </div>
      </div>
    </>
  )
}

export default SearchPage

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiTrendingUp } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { closeSearch } from '../../store/slices/uiSlice'
import { searchProducts, clearSearchResults } from '../../store/slices/productSlice'
import { debounce } from '../../utils/helpers'
import ProductCard from '../product/ProductCard'

const trendingSearches = ['Anarkali Kurti', 'Silk Saree', 'Cotton Kurti', 'Festival Wear', 'Party Wear', 'Lehenga']

const SearchModal = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const { searchResults } = useSelector((state) => state.products)

  useEffect(() => {
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      dispatch(clearSearchResults())
    }
  }, [dispatch])

  const debouncedSearch = debounce((q) => {
    if (q.trim().length > 1) dispatch(searchProducts(q))
    else dispatch(clearSearchResults())
  }, 400)

  const handleChange = (e) => {
    setQuery(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      dispatch(closeSearch())
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleTrending = (term) => {
    dispatch(closeSearch())
    navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && dispatch(closeSearch())}
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-2xl"
      >
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto px-4 py-5">
          <FiSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search for kurtis, sarees, ethnic wear..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 py-4 text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
          />
          {query ? (
            <button
              type="button"
              onClick={() => { setQuery(''); dispatch(clearSearchResults()) }}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <FiX size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dispatch(closeSearch())}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <FiX size={18} />
            </button>
          )}
        </form>
      </motion.div>

      {/* Results Panel */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        {searchResults.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
            <p className="text-gray-400 text-sm mb-4">{searchResults.length} results for "<span className="text-gray-700 font-medium">{query}</span>"</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {searchResults.map((product) => (
                <div key={product._id} onClick={() => dispatch(closeSearch())}>
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiTrendingUp className="text-yellow-500" size={16} />
              <span className="text-gray-500 text-sm font-medium">Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleTrending(term)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:text-yellow-600 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default SearchModal

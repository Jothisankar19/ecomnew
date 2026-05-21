import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiGrid, FiList } from 'react-icons/fi'
import { fetchProducts, setFilters } from '../store/slices/productSlice'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import api from '../utils/api'
/* ── Filter data ─────────────────────────────────────────────── */
const COLORS = [
  { name: 'Blue', hex: '#3b82f6' }, { name: 'Green', hex: '#22c55e' },
  { name: 'Pink', hex: '#ec4899' }, { name: 'Black', hex: '#1f2937' },
  { name: 'Red', hex: '#ef4444' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'White', hex: '#f9fafb' }, { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Maroon', hex: '#7f1d1d' },
  { name: 'Teal', hex: '#14b8a6' }, { name: 'Beige', hex: '#d4b896' },
]

const KURTI_CATEGORIES = [
  'Anarkali Kurtis', 'A-Line Kurtis', 'Straight Kurtis', 'Flared Kurtis',
  'Asymmetric Kurtis', 'Kaftan Kurtis', 'Printed Kurtis', 'Embroidered Kurtis',
  'Plain Kurtis', 'Block Print Kurtis', 'Casual Kurtis', 'Office Kurtis',
  'Party Wear Kurtis', 'Festival Kurtis',
]

const FABRICS = ['Cotton', 'Silk', 'Rayon', 'Georgette', 'Chiffon', 'Linen', 'Polyester', 'Viscose']

const FIT_SILHOUETTE = ['Relaxed Fit', 'Slim Fit', 'Regular Fit', 'Oversized', 'Bodycon']

const PATTERNS = ['Floral', 'Geometric', 'Abstract', 'Solid', 'Stripes', 'Checks', 'Animal Print', 'Paisley']

const SLEEVE_LENGTHS = ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Cap Sleeve']

const NECK_TYPES = ['Round Neck', 'V-Neck', 'Boat Neck', 'Collar Neck', 'Mandarin Collar', 'Sweetheart']

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
]

/* ── Collapsible filter section ─────────────────────────────── */
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        {open ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Checkbox item ───────────────────────────────────────────── */
const CheckItem = ({ label, count, checked, onChange }) => (
  <label className="flex items-center justify-between gap-2 py-1 cursor-pointer group">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 accent-yellow-500 rounded"
      />
      <span className={`text-sm transition-colors ${checked ? 'text-yellow-600 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-xs text-gray-400">({count})</span>
    )}
  </label>
)

/* ── Sidebar ─────────────────────────────────────────────────── */
const FilterSidebar = ({ localFilters, setLocalFilters, onApply, onClear, categories, lockedCategoryId, lockedCategoryName }) => {
  const toggle = (key, value) => {
    setLocalFilters(prev => {
      const arr = prev[key] || []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  const isChecked = (key, value) => (localFilters[key] || []).includes(value)

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <FiFilter size={16} className="text-yellow-500" /> Filters
          </h3>
          <button
            onClick={onClear}
            className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            Clear All
          </button>
        </div>


        <FilterSection title="Colour">
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => toggle('colors', c.name)}
                title={c.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${isChecked('colors', c.name) ? 'border-yellow-500 scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          {(localFilters.colors || []).length > 0 && (
            <p className="text-xs text-yellow-600 mt-2">{(localFilters.colors).join(', ')}</p>
          )}
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category">
          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {(categories.length > 0 ? categories.map(c => c.name) : KURTI_CATEGORIES).map(cat => (
              <CheckItem
                key={cat}
                label={cat}
                checked={isChecked('categoryNames', cat)}
                onChange={() => toggle('categoryNames', cat)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Fabric */}
        <FilterSection title="Fabric">
          <div className="space-y-0.5">
            {FABRICS.map(f => (
              <CheckItem key={f} label={f} checked={isChecked('fabrics', f)} onChange={() => toggle('fabrics', f)} />
            ))}
          </div>
        </FilterSection>

        {/* Fit / Silhouette */}
        <FilterSection title="Fit / Silhouette">
          <div className="space-y-0.5">
            {FIT_SILHOUETTE.map(f => (
              <CheckItem key={f} label={f} checked={isChecked('fits', f)} onChange={() => toggle('fits', f)} />
            ))}
          </div>
        </FilterSection>

        {/* Pattern & Print */}
        <FilterSection title="Pattern & Print">
          <div className="space-y-0.5">
            {PATTERNS.map(p => (
              <CheckItem key={p} label={p} checked={isChecked('patterns', p)} onChange={() => toggle('patterns', p)} />
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={localFilters.minPrice || ''}
                onChange={e => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={localFilters.maxPrice || ''}
                onChange={e => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-yellow-400"
              />
            </div>
            {/* Quick price ranges */}
            <div className="flex flex-wrap gap-1.5">
              {[['Under ₹500', '', '500'], ['₹500–₹1000', '500', '1000'], ['₹1000–₹2000', '1000', '2000'], ['₹2000+', '2000', '']].map(([label, min, max]) => (
                <button
                  key={label}
                  onClick={() => setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${localFilters.minPrice === min && localFilters.maxPrice === max
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Size */}
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {SIZES.map(s => (
              <button
                key={s}
                onClick={() => toggle('sizes', s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isChecked('sizes', s)
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Sleeve Length */}
        <FilterSection title="Sleeve Length" defaultOpen={false}>
          <div className="space-y-0.5">
            {SLEEVE_LENGTHS.map(s => (
              <CheckItem key={s} label={s} checked={isChecked('sleeves', s)} onChange={() => toggle('sleeves', s)} />
            ))}
          </div>
        </FilterSection>

        {/* Neck Type */}
        <FilterSection title="Neck" defaultOpen={false}>
          <div className="space-y-0.5">
            {NECK_TYPES.map(n => (
              <CheckItem key={n} label={n} checked={isChecked('necks', n)} onChange={() => toggle('necks', n)} />
            ))}
          </div>
        </FilterSection>

        {/* Apply Button (mobile only) */}
        <button
          onClick={onApply}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-white font-bold text-sm py-3 rounded-xl transition-colors mt-2 lg:hidden"
        >
          View Results
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
const ProductsPage = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, total, pages, loading, filters } = useSelector(state => state.products)
  const [categories, setCategories] = useState([])
  const [activeCategoryName, setActiveCategoryName] = useState('')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('newest')
  const [viewMode, setViewMode] = useState('grid') // grid | list

  // Read URL params once on mount
  const urlCategoryId = searchParams.get('category') || ''

  // Local filter state (applied on button click)
  const [localFilters, setLocalFilters] = useState({
    colors: [], categoryNames: [], fabrics: [], fits: [],
    patterns: [], sizes: [], sleeves: [], necks: [],
    minPrice: '', maxPrice: '',
  })

  // Auto-apply filters when selection changes
  const debounceRef = useRef(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const newFilters = {}
      if (urlCategoryId) newFilters.category = urlCategoryId
      if (localFilters.minPrice) newFilters.minPrice = localFilters.minPrice
      if (localFilters.maxPrice) newFilters.maxPrice = localFilters.maxPrice
      if (localFilters.sizes.length) newFilters.size = localFilters.sizes[0]
      if (localFilters.colors.length) newFilters.color = localFilters.colors[0]
      dispatch(setFilters(newFilters))
      setPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [localFilters, urlCategoryId, dispatch])

  // Existing handleApplyFilters remains for mobile drawer
  const handleApplyFilters = () => {
    // For mobile drawer, close after applying (filters already applied via auto effect)
    setMobileFilterOpen(false)
  }

  // Sync URL params to Redux filters dynamically whenever query parameters change
  useEffect(() => {
    const params = {}
    searchParams.forEach((v, k) => { params[k] = v })
    if (params.sort) {
      setSort(params.sort)
    } else {
      setSort('newest')
    }
    dispatch(setFilters(params))
    setPage(1)
  }, [searchParams, dispatch])

  // Fetch products — always include URL category to prevent race condition
  useEffect(() => {
    const params = { ...filters, sort, page }
    // Always enforce the URL category param (guards against stale Redux state on first render)
    if (urlCategoryId) params.category = urlCategoryId
    Object.keys(params).forEach(k => !params[k] && delete params[k])
    dispatch(fetchProducts(params))
  }, [filters, sort, page, dispatch, urlCategoryId])

  // Fetch categories and resolve active category name from URL param
  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      const cats = data.categories || []
      setCategories(cats)
      // If we arrived with ?category=<id>, resolve the name for display
      const categoryId = searchParams.get('category')
      if (categoryId) {
        const found = cats.find(c => c._id === categoryId)
        if (found) setActiveCategoryName(found.name)
      }
    })
  }, [])



  const handleClearFilters = () => {
    setLocalFilters({ colors: [], categoryNames: [], fabrics: [], fits: [], patterns: [], sizes: [], sleeves: [], necks: [], minPrice: '', maxPrice: '' })
    // Preserve the URL category (flash sale category) when clearing sidebar filters
    dispatch(setFilters({ category: urlCategoryId || '', minPrice: '', maxPrice: '', rating: '', size: '', sort: 'newest' }))
    setPage(1)
  }

  // Page title from URL
  const isFlashSaleCategory = !!searchParams.get('category') && !!activeCategoryName
  const pageTitle = searchParams.get('isTrending') ? 'Trending Kurtis'
    : searchParams.get('isNewArrival') ? 'New Arrivals'
      : searchParams.get('isBestSeller') ? 'Best Sellers'
        : searchParams.get('hasDiscount') ? 'Flash Sale Deals'
          : isFlashSaleCategory ? `${activeCategoryName} – Flash Sale`
            : 'Kurtis And Kurta for Women'

  const pageDesc = searchParams.get('hasDiscount') || isFlashSaleCategory
    ? `Shop limited-time flash sale offers on ${activeCategoryName || 'premium ethnic kurtis'} before stocks run out!`
    : 'Buy Kurtis online at best prices. Shop from our wide collection of Anarkali, Printed, Embroidered, Straight, A-Line kurtis in all sizes.'

  return (
    <>
      <Helmet>
        <title>{pageTitle} - Kurti Elegance</title>
        <meta name="description" content={pageDesc} />
      </Helmet>

      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="page-container py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-yellow-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-yellow-600 transition-colors">Women</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">{pageTitle}</span>
          </nav>

          {/* Page Header */}
          <div className="mb-5">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="font-display text-2xl font-bold text-gray-800">{pageTitle}</h1>
              {isFlashSaleCategory && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  Flash Sale Active
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">{pageDesc}</p>
          </div>

          <div className="flex gap-6">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:block">
              <FilterSidebar
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                categories={categories}
                lockedCategoryId={urlCategoryId}
                lockedCategoryName={activeCategoryName}
              />
            </aside>

            {/* ── Products Area ── */}
            <div className="flex-1 min-w-0">

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-5 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-yellow-400 transition-colors"
                  >
                    <FiFilter size={14} /> Filters
                  </button>
                  <p className="text-gray-400 text-sm">
                    <span className="font-semibold text-gray-700">{total}</span> products
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View mode */}
                  <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <FiGrid size={14} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <FiList size={14} />
                    </button>
                  </div>
                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 hidden sm:block">Sort:</span>
                    <select
                      value={sort}
                      onChange={e => { setSort(e.target.value); setPage(1) }}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400 bg-white cursor-pointer"
                    >
                      {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {(localFilters.colors.length > 0 || localFilters.sizes.length > 0 || localFilters.minPrice || localFilters.maxPrice) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {localFilters.colors.map(c => (
                    <span key={c} className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1 rounded-full">
                      {c}
                      <button onClick={() => setLocalFilters(p => ({ ...p, colors: p.colors.filter(x => x !== c) }))}><FiX size={10} /></button>
                    </span>
                  ))}
                  {localFilters.sizes.map(s => (
                    <span key={s} className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1 rounded-full">
                      Size: {s}
                      <button onClick={() => setLocalFilters(p => ({ ...p, sizes: p.sizes.filter(x => x !== s) }))}><FiX size={10} /></button>
                    </span>
                  ))}
                  {(localFilters.minPrice || localFilters.maxPrice) && (
                    <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1 rounded-full">
                      ₹{localFilters.minPrice || '0'} – ₹{localFilters.maxPrice || '∞'}
                      <button onClick={() => setLocalFilters(p => ({ ...p, minPrice: '', maxPrice: '' }))}><FiX size={10} /></button>
                    </span>
                  )}
                </div>
              )}

              {/* Product Grid Container with Custom Page Loader */}
              <div className="relative min-h-[400px]">
                {/* Premium Themed Loader Overlay */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-start pt-24 z-10 transition-all duration-300 pointer-events-none"
                    >
                      <div className="flex flex-col items-center gap-4 bg-white/95 p-8 rounded-3xl border border-gray-100/60 shadow-xl max-w-xs text-center backdrop-blur-md sticky top-36 pointer-events-auto">
                        {/* Rotating Gold Embroidery Hoop Spinner */}
                        <div className="relative w-14 h-14">
                          <div className="absolute inset-0 rounded-full border-[3px] border-yellow-100 border-t-yellow-600 animate-spin" />
                          <div className="absolute inset-2 rounded-full bg-yellow-500/10 flex items-center justify-center animate-pulse">
                            <span className="text-yellow-600 font-serif text-[9px] font-black tracking-widest">KE</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-gray-800 font-serif text-sm font-bold tracking-wide">Loading Please Wait...</h4>
                          <p className="text-gray-400 text-[9px] uppercase tracking-[0.2em] mt-1">Stitching perfect fits</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skeletons on initial mount or Empty State or Product Cards Grid */}
                {products.length === 0 && !loading ? (
                  <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                    <p className="text-5xl mb-4">🔍</p>
                    <h3 className="text-gray-700 text-lg font-semibold mb-2">No kurtis found</h3>
                    <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                    <button onClick={handleClearFilters} className="btn-primary text-sm">Clear Filters</button>
                  </div>
                ) : products.length === 0 && loading ? (
                  <SkeletonGrid count={9} />
                ) : (
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                      : 'flex flex-col gap-4'
                  }>
                    {products.map((product, i) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: Math.min(pages, 8) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-yellow-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Mobile Action Pill ── */}
      {!mobileFilterOpen && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200/50 shadow-2xl flex items-center gap-6 divide-x divide-gray-150 transition-all duration-300">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-wider hover:text-yellow-600 transition-colors active:scale-95"
          >
            <FiFilter size={14} className="text-yellow-600 animate-pulse" /> Filters
          </button>
          <div className="pl-6 flex items-center gap-2">
            <FiList size={14} className="text-yellow-600" />
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1) }}
              className="bg-transparent text-gray-700 font-bold text-xs uppercase tracking-wider focus:outline-none cursor-pointer pr-1"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800 text-base">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <FiX size={20} />
                </button>
              </div>
              <FilterSidebar
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                categories={categories}
                lockedCategoryId={urlCategoryId}
                lockedCategoryName={activeCategoryName}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ProductsPage

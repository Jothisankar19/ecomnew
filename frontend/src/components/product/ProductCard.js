import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice'
import { openAuthModal } from '../../store/slices/uiSlice'
import { formatPrice, calcDiscount } from '../../utils/helpers'
import { useProductOffer } from '../../context/SaleContext'
import StarRating from '../ui/StarRating'
import toast from 'react-hot-toast'

// ── Login prompt toast ────────────────────────────────────────
const showLoginPrompt = (dispatch, message = 'Please login to continue') => {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${t.visible ? 'opacity-100' : 'opacity-0'} bg-white border border-gray-100 shadow-xl rounded-2xl px-5 py-4 flex items-center gap-4 max-w-sm`}
      >
        <div className="w-10 h-10 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center flex-shrink-0">
          <FiUser size={18} className="text-yellow-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-semibold text-sm">{message}</p>
          <p className="text-gray-400 text-xs mt-0.5">Sign in to add items to your cart</p>
        </div>
        <button
          onClick={() => {
            toast.dismiss(t.id)
            dispatch(openAuthModal('login'))
          }}
          className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
        >
          Login
        </button>
      </motion.div>
    ),
    { duration: 4000, position: 'top-center' }
  )
}

const ProductCard = ({ product, compact = false }) => {
  const dispatch = useDispatch()
  const [imageIndex, setImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const isWishlisted = useSelector(selectIsWishlisted(product._id))
  const saleOffer = useProductOffer(product._id)
  
  const scrollRef = useRef(null)

  const handleScroll = (e) => {
    const container = e.currentTarget
    const scrollLeft = container.scrollLeft
    const width = container.clientWidth
    if (width > 0) {
      const index = Math.round(scrollLeft / width)
      if (index !== imageIndex && index < images.length) {
        setImageIndex(index)
      }
    }
  }

  const scrollToImage = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth
      scrollRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      })
      setImageIndex(index)
    }
  }

  const scrollNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (scrollRef.current) {
      const nextIndex = Math.min(imageIndex + 1, images.length - 1)
      scrollToImage(e, nextIndex)
    }
  }

  const scrollPrev = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (scrollRef.current) {
      const prevIndex = Math.max(imageIndex - 1, 0)
      scrollToImage(e, prevIndex)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      showLoginPrompt(dispatch, 'Login to add to cart')
      return
    }
    dispatch(addToCart({
      productId: product._id,
      quantity: 1,
      size: product.sizes?.[0]?.size,
      color: product.colors?.[0]?.name,
    }))
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      showLoginPrompt(dispatch, 'Login to save to wishlist')
      return
    }
    dispatch(toggleWishlist(product._id))
  }

  // ── Price & Discount Logic ──
  // Priority: sale campaign offer > product's own discountPrice > regular price
  const basePrice = product.price
  const productDiscountPrice = product.discountPrice
  const productDiscount = calcDiscount(basePrice, productDiscountPrice)

  let displayPrice, originalPrice, discountPercent, hasSale
  if (saleOffer) {
    // Active sale campaign on this product
    const saleBase = productDiscountPrice || basePrice
    displayPrice = saleOffer.offerPrice
    originalPrice = saleBase
    discountPercent = saleOffer.discountPercent
    hasSale = true
  } else if (productDiscountPrice) {
    // Product's own discount
    displayPrice = productDiscountPrice
    originalPrice = basePrice
    discountPercent = productDiscount
    hasSale = false
  } else {
    displayPrice = basePrice
    originalPrice = null
    discountPercent = 0
    hasSale = false
  }

  const images = product.images || []
  const currentImage = images[imageIndex]?.url || images[0]?.url || 'https://via.placeholder.com/400x500?text=Kurti'

  if (compact) {
    return (
      <Link to={`/products/${product.slug || product._id}`} className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
        <div className="relative">
          <img src={currentImage} alt={product.name} className="w-16 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-100" />
          {hasSale && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-1 py-0.5 rounded leading-none">SALE</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 font-medium truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-bold text-sm ${hasSale ? 'text-red-600' : 'text-yellow-600'}`}>{formatPrice(displayPrice)}</span>
            {originalPrice && (
              <span className="text-gray-300 text-xs line-through">{formatPrice(originalPrice)}</span>
            )}
            {discountPercent > 0 && (
              <span className={`text-[10px] font-bold ${hasSale ? 'text-red-500' : 'text-green-600'}`}>{discountPercent}% OFF</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug || product._id}`}>
        <div className="relative aspect-[2/3] md:aspect-[3/4] overflow-hidden bg-gray-50 group/image">
          {/* Scrollable Carousel Images Container */}
          <motion.div
            ref={scrollRef}
            onScroll={handleScroll}
            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
            animate={{ scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.4 }}
          >
            {images.length > 0 ? (
              images.map((img, i) => (
                <div key={i} className="w-full h-full flex-shrink-0 snap-start snap-always">
                  <img
                    src={img.url}
                    alt={`${product.name} - ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex-shrink-0 snap-start snap-always">
                <img
                  src="https://via.placeholder.com/400x500?text=Kurti"
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
          </motion.div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={scrollPrev}
                disabled={imageIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-150 flex items-center justify-center text-gray-700 shadow-md hover:bg-white hover:text-yellow-600 transition-all z-20 focus:outline-none disabled:opacity-0 disabled:pointer-events-none md:flex hidden opacity-0 group-hover/image:opacity-100"
              >
                <FiChevronLeft size={16} />
              </button>
              {/* Right Arrow */}
              <button
                onClick={scrollNext}
                disabled={imageIndex === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-150 flex items-center justify-center text-gray-700 shadow-md hover:bg-white hover:text-yellow-600 transition-all z-20 focus:outline-none disabled:opacity-0 disabled:pointer-events-none md:flex hidden opacity-0 group-hover/image:opacity-100"
              >
                <FiChevronRight size={16} />
              </button>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {hasSale && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide animate-pulse">
                🔥 Sale
              </span>
            )}
            {discountPercent > 0 && !hasSale && <span className="badge-sale">-{discountPercent}%</span>}
            {product.isNewArrival && <span className="badge-new">New</span>}
            {product.isTrending && <span className="badge-trending">🔥</span>}
          </div>

          {/* Wishlist */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: (isHovered || window.innerWidth < 768) ? 1 : 0 }} 
            className="absolute top-3 right-3"
          >
            <button onClick={handleWishlist}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                isWishlisted ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 hover:text-pink-500'
              }`}>
              <FiHeart size={14} className="md:size-4" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </motion.div>

          {/* Quick Add */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
              {/* Mobile: Smaller button always visible */}
              <button 
                onClick={handleAddToCart}
                className="md:hidden w-full bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-sm border border-gray-100"
              >
                <FiShoppingCart size={12} /> Add
              </button>
              
              {/* Desktop: Animated button on hover */}
              <motion.button
                onClick={handleAddToCart}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0 }}
                className="hidden md:flex w-full bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold py-2.5 rounded-xl items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <FiShoppingCart size={15} />
                {isAuthenticated ? 'Quick Add' : 'Add to Cart'}
              </motion.button>
            </div>
          )}

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Image dots */}
          {images.length > 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 z-20">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => scrollToImage(e, i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all hover:scale-125 focus:outline-none ${
                    i === imageIndex ? 'bg-yellow-500 w-2.5' : 'bg-white/75 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-gray-400 text-xs mb-1">{product.category?.name || 'Kurti'}</p>
          <h3 className="text-gray-800 font-semibold text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
          <StarRating rating={product.ratings} size={12} showCount count={product.numReviews} />
          
          {/* Price Display */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`font-bold ${hasSale ? 'text-red-600' : 'text-yellow-600'}`}>
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && originalPrice !== displayPrice && (
              <span className="text-gray-300 text-sm line-through">{formatPrice(originalPrice)}</span>
            )}
            {discountPercent > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                hasSale 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'text-green-600'
              }`}>
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {product.colors?.length > 0 && (
            <div className="flex gap-1 mt-2">
              {product.colors.slice(0, 5).map((color, i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color.hex || '#ccc' }} title={color.name} />
              ))}
              {product.colors.length > 5 && <span className="text-gray-400 text-xs">+{product.colors.length - 5}</span>}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard

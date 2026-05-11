import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiHeart, FiArrowRight, FiShoppingCart } from 'react-icons/fi'
import { fetchWishlist, toggleWishlist } from '../store/slices/wishlistSlice'
import { addToCart } from '../store/slices/cartSlice'
import { formatPrice, calcDiscount } from '../utils/helpers'
import StarRating from '../components/ui/StarRating'

const WishlistPage = () => {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((state) => state.wishlist)

  useEffect(() => { dispatch(fetchWishlist()) }, [dispatch])

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1, size: product.sizes?.[0]?.size, color: product.colors?.[0]?.name }))
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 page-container py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>My Wishlist - Kurti Elegance</title></Helmet>
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="page-container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FiHeart className="text-pink-500" size={28} /> My Wishlist
              </h1>
              <p className="text-gray-400 text-sm mt-1">{items.length} items saved</p>
            </div>
            {items.length > 0 && <Link to="/products" className="btn-secondary text-sm">Continue Shopping</Link>}
          </div>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
              <div className="w-24 h-24 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto mb-6">
                <FiHeart className="text-pink-400" size={40} />
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-800 mb-3">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-8">Save kurtis you love to your wishlist</p>
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                Explore Kurtis <FiArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((product, i) => {
                if (!product?._id) return null
                const discount = calcDiscount(product.price, product.discountPrice)
                const image = product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Kurti'
                return (
                  <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="product-card group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Link to={`/products/${product.slug || product._id}`}>
                        <img src={image} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {discount > 0 && <span className="badge-sale">-{discount}%</span>}
                        {product.isNewArrival && <span className="badge-new">New</span>}
                      </div>
                      <button onClick={() => dispatch(toggleWishlist(product._id))}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors shadow-md">
                        <FiHeart size={16} fill="currentColor" />
                      </button>
                      <motion.div initial={{ y: 20, opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAddToCart(product)}
                          className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
                          <FiShoppingCart size={16} /> Add to Cart
                        </button>
                      </motion.div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-400 text-xs mb-1">{product.category?.name || 'Kurti'}</p>
                      <Link to={`/products/${product.slug || product._id}`}>
                        <h3 className="text-gray-800 font-semibold text-sm leading-tight mb-2 line-clamp-2 hover:text-yellow-600 transition-colors">{product.name}</h3>
                      </Link>
                      <StarRating rating={product.ratings} size={12} showCount count={product.numReviews} />
                      <div className="flex items-center gap-2 mt-2">
                        {product.discountPrice ? (
                          <>
                            <span className="text-yellow-600 font-bold">{formatPrice(product.discountPrice)}</span>
                            <span className="text-gray-300 text-sm line-through">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="text-yellow-600 font-bold">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      <button onClick={() => handleAddToCart(product)}
                        className="w-full btn-secondary text-xs py-2 mt-3 flex items-center justify-center gap-1">
                        <FiShoppingCart size={13} /> Add to Cart
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default WishlistPage

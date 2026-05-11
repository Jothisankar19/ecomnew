import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiX, FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'
import { closeCart } from '../../store/slices/uiSlice'
import { updateCartItem, removeFromCart, fetchCart, selectCartItems, selectCartSubtotal } from '../../store/slices/cartSlice'
import { formatPrice } from '../../utils/helpers'
import toast from 'react-hot-toast'

const CartDrawer = () => {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const { coupon, loading } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const shipping = subtotal > 999 ? 0 : 99
  const couponDiscount = coupon?.discount || 0
  const tax = Math.round((subtotal - couponDiscount) * 0.05)
  const total = subtotal - couponDiscount + shipping + tax

  // Always fetch fresh cart data when drawer opens
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [dispatch, isAuthenticated])

  const handleIncrease = (item) => {
    const stock = item.product?.stock ?? 999
    if (item.quantity >= stock) {
      toast.error(`Only ${stock} item${stock === 1 ? '' : 's'} available in stock`, { duration: 2500 })
      return
    }
    dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))
  }

  const handleDecrease = (item) => {
    dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={() => dispatch(closeCart())}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-100 shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <FiShoppingCart className="text-yellow-500" size={22} />
              <h2 className="font-display text-xl font-bold text-gray-800">Shopping Cart</h2>
              {items.length > 0 && (
                <span className="w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(fetchCart())}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-yellow-600 rounded-full hover:bg-yellow-50 transition-all"
                title="Refresh prices"
              >
                <FiRefreshCw size={16} className={loading ? 'animate-spin text-yellow-500' : ''} />
              </button>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <FiShoppingBag className="text-gray-200 mx-auto mb-4" size={56} />
                <p className="text-gray-400 mb-5 font-medium">Your cart is empty</p>
                <button onClick={() => dispatch(closeCart())} className="btn-primary text-sm">
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const stock = item.product?.stock ?? 999
                const atMax = item.quantity >= stock
                const lowStock = stock > 0 && stock <= 5
                const price = Number(item.product?.discountPrice || item.product?.price || 0)

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 bg-gray-50 rounded-2xl p-3 border border-gray-100"
                  >
                    <Link to={`/products/${item.product?.slug || item.product?._id}`} onClick={() => dispatch(closeCart())}>
                      <img
                        src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80x100'}
                        alt={item.product?.name}
                        className="w-20 h-24 object-cover rounded-xl flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-semibold line-clamp-2 mb-1">{item.product?.name}</p>
                      <div className="flex gap-2 text-xs text-gray-400 mb-1">
                        {item.size && <span className="bg-gray-200 px-2 py-0.5 rounded-full">Size: {item.size}</span>}
                        {item.color && <span className="bg-gray-200 px-2 py-0.5 rounded-full">{item.color}</span>}
                      </div>

                      {/* Stock warning */}
                      {lowStock && (
                        <p className="text-orange-500 text-xs font-semibold flex items-center gap-1 mb-1">
                          <FiAlertTriangle size={11} /> Only {stock} left in stock
                        </p>
                      )}
                      {atMax && (
                        <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mb-1">
                          <FiAlertTriangle size={11} /> Maximum quantity reached
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-yellow-600 font-bold text-sm">
                            {formatPrice(price * (Number(item.quantity) || 1))}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-gray-400 text-xs ml-1">({formatPrice(price)} each)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-all"
                          >
                            <FiMinus size={11} />
                          </button>
                          <span className="text-gray-700 text-sm font-semibold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleIncrease(item)}
                            disabled={atMax}
                            className={`w-7 h-7 border rounded-full flex items-center justify-center transition-all ${
                              atMax
                                ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600'
                            }`}
                          >
                            <FiPlus size={11} />
                          </button>
                          <button
                            onClick={() => dispatch(removeFromCart(item._id))}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 ml-1 transition-all"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-700'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (5%)</span>
                  <span className="font-medium text-gray-700">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-800 font-bold text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-gradient-gold">{formatPrice(total)}</span>
                </div>
              </div>

              {subtotal < 999 && (
                <p className="text-xs text-yellow-600 text-center bg-yellow-50 rounded-lg py-2">
                  Add {formatPrice(999 - subtotal)} more for free shipping!
                </p>
              )}

              <Link
                to="/checkout"
                onClick={() => dispatch(closeCart())}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              >
                Proceed to Checkout <FiArrowRight size={18} />
              </Link>
              <Link
                to="/cart"
                onClick={() => dispatch(closeCart())}
                className="block text-center text-sm text-gray-500 hover:text-yellow-600 transition-colors py-1"
              >
                View Full Cart
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CartDrawer

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiTrash2, FiMinus, FiPlus, FiTag, FiArrowRight, FiShoppingBag, FiX, FiShield, FiTruck } from 'react-icons/fi'
import {
  updateCartItem, removeFromCart, applyCoupon, removeCouponLocal, fetchCart,
  selectCartItems, selectSavedItems, selectCartSubtotal
} from '../store/slices/cartSlice'
import { formatPrice } from '../utils/helpers'
import api from '../utils/api'
import toast from 'react-hot-toast'

const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const savedItems = useSelector(selectSavedItems)
  const subtotal = useSelector(selectCartSubtotal)
  const { coupon } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // Re-fetch cart on mount to get latest product prices
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [dispatch, isAuthenticated])

  const shipping = subtotal > 999 ? 0 : 99
  const couponDiscount = coupon?.discount || 0
  const tax = Math.round((subtotal - couponDiscount) * 0.05)
  const total = subtotal - couponDiscount + shipping + tax

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    await dispatch(applyCoupon({ code: couponCode, orderAmount: subtotal }))
    setCouponLoading(false)
  }

  const handleRemoveCoupon = async () => {
    try {
      await api.delete('/cart/remove-coupon')
      dispatch(removeCouponLocal())
      setCouponCode('')
      toast.success('Coupon removed')
    } catch {}
  }

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="pt-24 min-h-screen bg-[#FDF8F3] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
            <FiShoppingBag className="text-yellow-500" size={40} />
          </div>
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">It looks like you haven't added anything to your cart yet. Explore our latest collections and find something you'll love!</p>
          <Link to="/products" className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-200">
            Start Shopping <FiArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>Shopping Cart - Ethnic Elegance</title></Helmet>
      <div className="pt-24 min-h-screen bg-[#FDF8F3] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-10">
             <h1 className="font-display text-4xl font-bold text-gray-900">Your Bag</h1>
             <span className="bg-white border border-gray-200 text-gray-500 text-sm font-bold px-4 py-1 rounded-full shadow-sm">
               {items.reduce((s, i) => s + i.quantity, 0)} Items
             </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              {items.map((item) => (
                <motion.div 
                  key={item._id} 
                  layout 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 flex flex-col sm:flex-row gap-6 relative group"
                >
                  {/* Remove Button (Corner) */}
                  <button 
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2"
                    title="Remove item"
                  >
                    <FiX size={20} />
                  </button>

                  {/* Image */}
                  <Link 
                    to={`/products/${item.product?.slug || item.product?._id}`}
                    className="w-full sm:w-32 h-44 sm:h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50"
                  >
                    <img 
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/300x400?text=Product'}
                      alt={item.product?.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2 pr-8">
                        <Link to={`/products/${item.product?.slug || item.product?._id}`}>
                          <h3 className="text-gray-900 font-bold text-xl hover:text-yellow-600 transition-colors">
                            {item.product?.name}
                          </h3>
                        </Link>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        {item.size && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium">Size:</span>
                            <span className="text-gray-900 font-bold">{item.size}</span>
                          </div>
                        )}
                        {item.color && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium">Color:</span>
                            <span className="text-gray-900 font-bold">{item.color}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-medium">Status:</span>
                          {item.product?.stock > 0 ? (
                            <span className="text-green-600 font-bold">In Stock</span>
                          ) : (
                            <span className="text-red-500 font-bold">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-50">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-2 py-1.5 w-fit">
                        <button 
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                          disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white rounded-xl transition-all disabled:opacity-30"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="text-gray-900 font-bold w-10 text-center text-base">{item.quantity}</span>
                        <button 
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                          disabled={item.quantity >= (item.product?.stock || 0)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white rounded-xl transition-all disabled:opacity-30"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      {/* Price Display */}
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-2 sm:justify-end">
                          <p className="text-yellow-600 font-bold text-2xl">
                            {formatPrice((Number(item.product?.discountPrice || item.product?.price || 0)) * (Number(item.quantity) || 1))}
                          </p>
                        </div>
                        {item.product?.discountPrice && (
                          <p className="text-gray-400 text-sm line-through sm:justify-end flex">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {savedItems.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-gray-900 font-bold text-2xl">Saved for Later</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">{savedItems.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedItems.map((item) => (
                      <div key={item._id} className="bg-white/60 rounded-2xl border border-gray-100 p-4 flex gap-4 backdrop-blur-sm group hover:bg-white transition-all">
                        <img src={item.product?.images?.[0]?.url} alt="" className="w-16 h-20 object-cover rounded-xl" />
                        <div className="flex-1">
                          <p className="text-gray-900 text-sm font-bold truncate mb-1">{item.product?.name}</p>
                          <p className="text-yellow-600 text-base font-black">{formatPrice(item.product?.discountPrice || item.product?.price)}</p>
                          <button className="text-gray-400 text-xs font-bold mt-2 hover:text-yellow-600 transition-colors">Move to Bag</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Order Summary Column (Cols 9-12) */}
            <div className="lg:col-span-4 space-y-6 sticky top-28">
              {/* Promo Code Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
                <h3 className="text-gray-900 font-bold text-xl mb-6 flex items-center gap-2">
                  <FiTag className="text-yellow-500" /> Have a Promo Code?
                </h3>
                {coupon ? (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4">
                    <div>
                      <p className="text-yellow-800 font-black tracking-widest uppercase">{coupon.code}</p>
                      <p className="text-green-600 text-sm font-bold mt-1">-{formatPrice(coupon.discount)} Saved</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="w-8 h-8 bg-white text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm transition-all">
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code..." 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all" 
                    />
                    <button 
                      onClick={handleApplyCoupon} 
                      disabled={couponLoading} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 rounded-2xl transition-all disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary Details */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
                <h3 className="text-gray-900 font-bold text-xl mb-8">Order Summary</h3>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 font-bold">
                      <span>Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Estimated Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-bold' : 'text-gray-900 font-bold'}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Tax (GST 5%)</span>
                    <span className="text-gray-900 font-bold">{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-gray-900 text-lg font-black">Total</span>
                    <span className="text-yellow-600 text-3xl font-black">{formatPrice(total)}</span>
                  </div>
                </div>

                {subtotal < 999 ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-100 flex flex-col items-center text-center gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                       <FiTruck size={60} />
                    </div>
                    <p className="text-yellow-700 text-xs font-black uppercase tracking-[0.2em]">Unlock Free Shipping</p>
                    <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-yellow-100 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(subtotal / 999) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-yellow-500 rounded-full" 
                      />
                    </div>
                    <p className="text-gray-900 text-sm font-bold">
                      Add <span className="text-yellow-600">{formatPrice(999 - subtotal)}</span> more for <span className="text-green-600">FREE DELIVERY</span>!
                    </p>
                    <Link to="/products" className="text-yellow-600 text-xs font-bold hover:underline mt-1">
                      Browse more products
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 bg-green-50 rounded-3xl p-6 border border-green-100 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                       <FiTruck size={24} />
                    </div>
                    <div>
                      <p className="text-green-800 font-bold">You qualify for FREE Delivery!</p>
                      <p className="text-green-600 text-xs font-medium">Standard shipping fee has been waived.</p>
                    </div>
                  </motion.div>
                )}

                <button 
                  onClick={() => navigate('/checkout')}
                  disabled={items.some(item => (item.product?.stock || 0) <= 0)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-yellow-100 mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                >
                  {items.some(item => (item.product?.stock || 0) <= 0) ? 'Items Out of Stock' : 'Proceed to Checkout'}
                  <FiArrowRight size={20} />
                </button>
                
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mt-6">
                  <FiShield size={14} className="text-green-500" /> Secure Checkout
                </div>
              </div>

              {/* Keep Shopping Link */}
              <Link to="/products" className="flex items-center justify-center gap-2 text-gray-500 hover:text-yellow-600 font-bold transition-all">
                 Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky Mobile Checkout Bar */}
      {items.length > 0 && (
        <div className="sticky-mobile-bar flex items-center justify-between gap-4">
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Amount</p>
            <p className="text-yellow-600 text-xl font-black">{formatPrice(total)}</p>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            disabled={items.some(item => (item.product?.stock || 0) <= 0)}
            className="flex-1 bg-yellow-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-100 disabled:opacity-50"
          >
            Checkout <FiArrowRight size={18} />
          </button>
        </div>
      )}
    </>
  )
}

export default CartPage


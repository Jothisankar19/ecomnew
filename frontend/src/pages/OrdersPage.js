import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPackage, FiArrowRight, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiFilter } from 'react-icons/fi'
import api from '../utils/api'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../utils/helpers'

const statusFilters = [
  { id: 'all', label: 'All Orders', icon: FiPackage },
  { id: 'processing', label: 'Processing', icon: FiClock },
  { id: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
  { id: 'shipped', label: 'Shipped', icon: FiTruck },
  { id: 'delivered', label: 'Delivered', icon: FiCheckCircle },
  { id: 'cancelled', label: 'Cancelled', icon: FiXCircle },
]

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('all')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const params = activeStatus !== 'all' ? { status: activeStatus } : {}
        const { data } = await api.get('/orders/my-orders', { params })
        setOrders(data.orders || [])
        setTotal(data.total || 0)
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    fetchOrders()
  }, [activeStatus])

  return (
    <>
      <Helmet><title>My Orders - Ethnic Elegance</title></Helmet>
      <div className="pt-24 min-h-screen bg-[#FDF8F3] pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Order History</h1>
              <p className="text-gray-500 font-medium">Manage and track your recent orders</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
               <span className="text-yellow-600 font-bold text-lg">{total}</span>
               <span className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest">Orders</span>
            </div>
          </div>

          {/* Premium Filter Bar */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-10 pb-2">
            <div className="flex-shrink-0 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 mr-2">
               <FiFilter className="text-gray-400 ml-1" />
               <span className="text-xs font-black text-gray-300 uppercase tracking-widest pr-2 border-r border-gray-100">Filter</span>
            </div>
            {statusFilters.map((status) => (
              <button 
                key={status.id} 
                onClick={() => setActiveStatus(status.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                  activeStatus === status.id 
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-100' 
                    : 'bg-white border border-gray-100 text-gray-500 hover:border-yellow-400 hover:text-yellow-600'
                }`}
              >
                <status.icon size={16} />
                {status.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white/50 rounded-3xl animate-pulse border border-gray-100" />
                ))}
              </motion.div>
            ) : orders.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm"
              >
                <div className="w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-6">
                  <FiPackage className="text-yellow-500" size={40} />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">No orders found</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't placed any orders in this category yet.</p>
                <Link to="/products" className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-100">
                  Start Shopping <FiArrowRight size={20} />
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {orders.map((order, i) => (
                  <motion.div 
                    key={order._id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-yellow-200 transition-all group"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                              <FiPackage className="text-gray-400 group-hover:text-yellow-600" size={24} />
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-gray-900 font-black text-lg">Order #{order.orderId}</span>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                                  {getStatusLabel(order.orderStatus)}
                                </span>
                              </div>
                              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Amount</p>
                              <p className="text-yellow-600 font-black text-2xl">{formatPrice(order.pricing?.total)}</p>
                           </div>
                           <Link 
                            to={`/orders/${order._id}`}
                            className="w-12 h-12 bg-gray-50 hover:bg-yellow-500 hover:text-white text-gray-400 rounded-2xl flex items-center justify-center transition-all shadow-sm group/btn"
                           >
                             <FiArrowRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                           </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                        {order.items?.map((item, j) => (
                          <div key={j} className="flex-shrink-0 group/item relative">
                            <div className="w-20 h-28 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                              <img 
                                src={item.image || 'https://via.placeholder.com/150'} 
                                alt={item.name}
                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                              />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-900 shadow-sm">
                               {item.quantity}
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 4 && (
                          <div className="flex-shrink-0 w-20 h-28 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                             +{order.items.length - 4} More
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

export default OrdersPage

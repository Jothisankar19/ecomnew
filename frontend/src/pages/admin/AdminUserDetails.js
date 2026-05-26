import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiArrowLeft, FiShoppingBag, FiDollarSign, FiCalendar, FiUser, FiActivity, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import api from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import AdminLayout from '../../components/layout/AdminLayout'
import toast from 'react-hot-toast'

const AdminUserDetails = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/admin/users/${id}/analytics`)
        setData(res.data)
      } catch (err) {
        toast.error('Failed to fetch user analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [id])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!data || !data.user) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-700">User not found</h2>
          <Link to="/admin/users" className="text-yellow-600 mt-4 inline-block hover:underline">
            &larr; Back to Users
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const { user, analytics, recentOrders } = data

  return (
    <AdminLayout>
      <Helmet><title>{user.name} Analytics — Admin</title></Helmet>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/users" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            User Analytics <FiActivity className="text-yellow-500" />
          </h1>
          <p className="text-sm text-gray-500">Detailed insights and order history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=D4AF37&color=fff&size=100`}
              alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-yellow-50 mb-4 shadow-sm" />
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <span className={`mt-2 text-xs px-3 py-1 rounded-full font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {user.isActive ? 'Active User' : 'Blocked User'}
            </span>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><FiMail size={16} /></div>
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><FiPhone size={16} /></div>
              <span>{user.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><FiCalendar size={16} /></div>
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><FiUser size={16} /></div>
              <span className="capitalize">Role: {user.role}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-yellow-100 text-sm font-medium mb-1">Total Spent</p>
              <h3 className="text-3xl font-bold">₹{Number(analytics.totalSpent || 0).toLocaleString()}</h3>
            </div>
            <FiDollarSign className="absolute -bottom-4 -right-4 text-white/20" size={100} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-yellow-200 transition-colors">
            <div className="relative z-10">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
                <FiShoppingBag size={24} />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{analytics.totalOrders}</h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-yellow-200 transition-colors sm:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Average Order Value</p>
                <h3 className="text-2xl font-bold text-gray-800">₹{Number(analytics.averageOrderValue || 0).toLocaleString()}</h3>
              </div>
              <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                <FiActivity size={32} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Orders */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h3>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ORDER ID', 'DATE', 'ITEMS', 'TOTAL', 'STATUS', 'PAYMENT'].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No orders found for this user</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:underline">
                      <Link to={`/admin/orders`}>#{order._id.slice(-6)}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length || 0} items</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">₹{order.pricing?.total?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        order.payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.payment?.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminUserDetails

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  FiShoppingBag, FiUsers, FiPackage, FiTrendingUp,
  FiArrowUp, FiArrowDown, FiArrowRight, FiDollarSign,
  FiEye, FiRefreshCw, FiCalendar
} from 'react-icons/fi'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import api from '../../utils/api'
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import AdminLayout from '../../components/layout/AdminLayout'

// ── INR formatter ────────────────────────────────────────────
const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

const COLORS = ['#D4AF37', '#6366f1', '#ec4899', '#10b981', '#f97316', '#06b6d4']

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, change, gradient, iconBg, iconColor, prefix, delay = 0, link }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border border-white ${gradient} hover:shadow-md transition-shadow cursor-pointer`}
    >
      {/* Decorative circle */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-white" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full opacity-10 bg-white" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm`}>
            <Icon size={22} className={iconColor} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              Number(change) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {Number(change) >= 0 ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
              {Math.abs(Number(change))}%
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
          {prefix === '₹' ? formatINR(value) : (value || 0).toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-gray-400 mt-1">vs last month</p>
      </div>
    </motion.div>
  );

  return link ? <Link to={link} className="block">{content}</Link> : content;
}

// ── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-bold text-gray-800">{formatINR(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

// ── Main Dashboard ─────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [categoryRevenue, setCategoryRevenue] = useState([])
  const [period, setPeriod] = useState('7days')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [dashRes, revenueRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get(`/admin/analytics/revenue?period=${period}`)
      ])
      setStats(dashRes.data)
      setRevenueData(revenueRes.data.revenueData || [])
      setCategoryRevenue(revenueRes.data.categoryRevenue || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchData() }, [period])



  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Revenue', value: stats?.stats?.totalRevenue, icon: FiDollarSign,
      gradient: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      iconBg: 'bg-white/30', iconColor: 'text-white',
      change: stats?.stats?.revenueGrowth, prefix: '₹', delay: 0, link: '/admin/orders'
    },
    {
      title: 'Total Orders', value: stats?.stats?.totalOrders, icon: FiShoppingBag,
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      iconBg: 'bg-white/30', iconColor: 'text-white',
      delay: 0.08, link: '/admin/orders'
    },
    {
      title: 'Customers', value: stats?.stats?.totalUsers, icon: FiUsers,
      gradient: 'bg-gradient-to-br from-emerald-400 to-green-500',
      iconBg: 'bg-white/30', iconColor: 'text-white',
      delay: 0.16, link: '/admin/users'
    },
    {
      title: 'Active Products', value: stats?.stats?.totalProducts, icon: FiPackage,
      gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      iconBg: 'bg-white/30', iconColor: 'text-white',
      delay: 0.24, link: '/admin/products'
    },
  ]

  return (
    <AdminLayout>
      <Helmet><title>Dashboard — Kurti Elegance Admin</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1.5">
            <FiCalendar size={13} />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-all shadow-sm"
        >
          <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          {
            label: 'This Month Revenue', value: formatINR(stats?.stats?.monthRevenue),
            icon: FiTrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', link: '/admin/orders'
          },
          {
            label: 'Pending Orders', value: stats?.stats?.pendingOrders || 0,
            icon: FiShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', link: '/admin/orders'
          },
          {
            label: 'This Month Orders', value: stats?.stats?.monthOrders || 0,
            icon: FiPackage, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', link: '/admin/orders'
          },
        ].map((item, i) => (
          <Link to={item.link} key={item.label} className="block">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className={`bg-white rounded-2xl p-4 border ${item.border} shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow`}
            >
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <item.icon size={20} className={item.color} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{item.label}</p>
                <p className="text-gray-800 font-bold text-xl">{item.value}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-gray-800 font-bold">Revenue Analytics</h3>
              <p className="text-gray-400 text-xs mt-0.5">Income trend over time (INR)</p>
            </div>
            <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
              {[['7days', '7D'], ['30days', '30D'], ['12months', '12M']].map(([val, label]) => (
                <button key={val} onClick={() => setPeriod(val)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all font-semibold ${
                    period === val ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={revenueData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="_id" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fef9ec' }} />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-300">
              <FiTrendingUp size={40} className="mb-2" />
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-gray-800 font-bold">Sales by Category</h3>
            <p className="text-gray-400 text-xs mt-0.5">Revenue distribution</p>
          </div>
          {categoryRevenue.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="revenue" paddingAngle={3}>
                    {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [formatINR(v), 'Revenue']}
                    contentStyle={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {categoryRevenue.slice(0, 5).map((cat, i) => (
                  <div key={cat._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-500 text-xs truncate max-w-[100px]">{cat._id}</span>
                    </div>
                    <span className="text-gray-700 text-xs font-semibold">{formatINR(cat.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-300">
              <FiPackage size={36} className="mb-2" />
              <p className="text-sm">No data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h3 className="text-gray-800 font-bold">Recent Orders</h3>
              <p className="text-gray-400 text-xs">Latest transactions</p>
            </div>
            <Link to="/admin/orders" className="flex items-center gap-1 text-yellow-600 text-xs font-semibold hover:text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg transition-colors">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentOrders?.length > 0 ? stats.recentOrders.slice(0, 6).map((order) => (
              <Link to="/admin/orders" key={order._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-700 text-sm font-semibold">#{order.orderId}</p>
                  <p className="text-gray-400 text-xs truncate">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right ml-3 flex-shrink-0 flex flex-col items-end gap-1">
                  <p className="text-gray-800 text-sm font-bold">{formatINR(order.pricing?.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.orderStatus)}`}>
                    {getStatusLabel(order.orderStatus)}
                  </span>
                </div>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-gray-300">
                <FiShoppingBag size={32} className="mx-auto mb-2" />
                <p className="text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h3 className="text-gray-800 font-bold">Best Selling Kurtis</h3>
              <p className="text-gray-400 text-xs">Top products by sales</p>
            </div>
            <Link to="/admin/products" className="flex items-center gap-1 text-yellow-600 text-xs font-semibold hover:text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg transition-colors">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.topProducts?.length > 0 ? stats.topProducts.map((product, i) => (
              <Link to="/admin/products" key={product._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer">
                <span className="text-gray-300 text-sm font-bold w-5 flex-shrink-0">{i + 1}</span>
                <img
                  src={product.images?.[0]?.url || 'https://via.placeholder.com/40x50?text=K'}
                  alt={product.name}
                  className="w-10 h-12 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 text-sm font-semibold truncate">{product.name}</p>
                  <p className="text-gray-400 text-xs">{product.category?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gray-800 text-sm font-bold">{formatINR(product.price)}</p>
                  <p className="text-green-600 text-xs font-medium">{product.sold} sold</p>
                </div>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-gray-300">
                <FiPackage size={32} className="mx-auto mb-2" />
                <p className="text-sm">No products yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard

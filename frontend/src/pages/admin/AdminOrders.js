import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiSearch, FiEdit2, FiX, FiTruck, FiPackage, FiTrash2, FiRefreshCw, FiCalendar, FiDollarSign, FiCheckCircle, FiRotateCcw, FiXCircle } from 'react-icons/fi'
import api from '../../utils/api'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import AdminLayout from '../../components/layout/AdminLayout'
import toast from 'react-hot-toast'

const statusOptions = [
  'all', 'processing', 'confirmed', 'packed', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'
]

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, subtext, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 group hover:shadow-md transition-shadow"
  >
    {/* Gradient glow */}
    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl ${gradient}`} />

    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${gradient} text-white shadow-lg`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl font-extrabold text-gray-800 leading-tight">{value}</h3>
      {subtext && <p className="text-gray-400 text-xs mt-0.5">{subtext}</p>}
    </div>
  </motion.div>
)

const UpdateStatusModal = ({ order, onClose, onUpdate }) => {
  const [status, setStatus] = useState(order.orderStatus)
  const [note, setNote] = useState('')
  const [trackingNumber, setTrackingNumber] = useState(order.tracking?.trackingNumber || '')
  const [carrier, setCarrier] = useState(order.tracking?.carrier || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put(`/orders/admin/${order._id}/status`, { status, note, trackingNumber, carrier })
      onUpdate(data.order)
      toast.success('Order status updated')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 font-bold text-lg">Update Order Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
        </div>
        <p className="text-gray-400 text-sm mb-5">Order <span className="text-yellow-600 font-semibold">#{order.orderId}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-yellow-400">
              {statusOptions.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{getStatusLabel(s)}</option>
              ))}
            </select>
          </div>
          {status === 'shipped' && (
            <>
              <div>
                <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Tracking Number</label>
                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Carrier</label>
                <input type="text" value={carrier} onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. Delhivery, BlueDart"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </>
          )}
          <div>
            <label className="text-gray-600 text-xs font-semibold mb-1.5 block">Note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..." rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
              {loading ? 'Updating...' : 'Update Status'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [summary, setSummary] = useState(null)
  const limit = 15

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search
      const { data } = await api.get('/orders/admin/all', { params })
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      if (data.summary) setSummary(data.summary)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [page, statusFilter])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchOrders() }
  const handleOrderUpdate = (updated) => setOrders(orders.map(o => o._id === updated._id ? updated : o))
  
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this order? This will remove all records of this transaction.')) return
    try {
      await api.delete(`/orders/admin/${orderId}`)
      setOrders(orders.filter(o => o._id !== orderId))
      setTotal(prev => prev - 1)
      toast.success('Order deleted permanently')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order')
    }
  }

  const pages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <Helmet><title>Orders — Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-400 text-sm">{total} total orders</p>
        </div>
      </div>

      {/* ─── Summary Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FiCalendar}
          label="Today's Orders"
          value={summary?.todayOrders ?? '—'}
          subtext={summary?.todayRevenue ? formatPrice(summary.todayRevenue) + ' revenue' : 'No orders yet'}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Delivered"
          value={summary?.deliveredOrders ?? '—'}
          subtext="Successfully completed"
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          delay={0.05}
        />
        <StatCard
          icon={FiRotateCcw}
          label="Returns"
          value={summary?.returnedOrders ?? '—'}
          subtext="Returned & requested"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          delay={0.1}
        />
        <StatCard
          icon={FiXCircle}
          label="Cancelled"
          value={summary?.cancelledOrders ?? '—'}
          subtext="Orders cancelled"
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
          delay={0.15}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" placeholder="Search by order ID..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400" />
          </div>
          <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">Search</button>
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400">
          {statusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : getStatusLabel(s)}</option>)}
        </select>
        <button onClick={fetchOrders} className="flex items-center gap-2 border border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              statusFilter === s ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600'
            }`}>
            {s === 'all' ? 'All' : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ORDER ID', 'CUSTOMER', 'DATE', 'AMOUNT', 'STATUS', 'PAYMENT', ''].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider ${i === 6 ? 'text-right' : 'text-left'} ${i === 2 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>)}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3"><span className="text-yellow-600 font-bold text-sm">#{order.orderId}</span></td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-sm font-medium">{order.user?.name}</p>
                      <p className="text-gray-400 text-xs">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-gray-400 text-xs">{formatDate(order.createdAt)}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-800 font-bold text-sm">{formatPrice(order.pricing?.total)}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${order.payment?.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.payment?.status?.charAt(0).toUpperCase() + order.payment?.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                        title="Update Status">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleDeleteOrder(order._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Permanently Delete Order">
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === page ? 'bg-yellow-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>{p}</button>
            ))}
          </div>
        )}

      <AnimatePresence>
        {selectedOrder && <UpdateStatusModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={handleOrderUpdate} />}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default AdminOrders


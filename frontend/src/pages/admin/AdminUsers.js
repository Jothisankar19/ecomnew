import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiSearch, FiUser, FiShield, FiToggleLeft, FiToggleRight, FiPhone, FiTrash2, FiRefreshCw, FiEye, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi'
import api from '../../utils/api'
import { formatDate } from '../../utils/helpers'
import AdminLayout from '../../components/layout/AdminLayout'
import toast from 'react-hot-toast'

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

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [summary, setSummary] = useState(null)
  const limit = 15

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const { data } = await api.get('/admin/users', { params })
      setUsers(data.users || [])
      setTotal(data.total || 0)
      if (data.summary) setSummary(data.summary)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`)
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u))
      
      // Update local summary state to reflect toggled status
      setSummary(prev => {
        if (!prev) return prev
        const wasActive = users.find(u => u._id === userId)?.isActive
        return {
          ...prev,
          activeUsers: wasActive ? prev.activeUsers - 1 : prev.activeUsers + 1,
          inactiveUsers: wasActive ? prev.inactiveUsers + 1 : prev.inactiveUsers - 1
        }
      })
      toast.success(data.message)
    } catch { toast.error('Failed to update user status') }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY remove this user? This action cannot be undone.')) return
    try {
      const userToDelete = users.find(u => u._id === userId)
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter(u => u._id !== userId))
      setTotal(prev => prev - 1)
      
      // Update local summary state
      setSummary(prev => {
        if (!prev) return prev
        return {
          ...prev,
          totalUsers: prev.totalUsers - 1,
          activeUsers: userToDelete?.isActive ? prev.activeUsers - 1 : prev.activeUsers,
          inactiveUsers: !userToDelete?.isActive ? prev.inactiveUsers - 1 : prev.inactiveUsers
        }
      })
      toast.success('User permanently removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const pages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <Helmet><title>Users — Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-400 text-sm">{total} registered users</p>
        </div>
      </div>

      {/* ─── Summary Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={FiUsers}
          label="Total Users"
          value={summary?.totalUsers ?? '—'}
          subtext="Registered accounts"
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          delay={0}
        />
        <StatCard
          icon={FiUserCheck}
          label="Active Users"
          value={summary?.activeUsers ?? '—'}
          subtext="Allowed standard access"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.05}
        />
        <StatCard
          icon={FiUserX}
          label="Not Active"
          value={summary?.inactiveUsers ?? '—'}
          subtext="Blocked / Suspended accounts"
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
          delay={0.1}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400">
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={fetchUsers} className="flex items-center gap-2 border border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['USER', 'CONTACT', 'ROLE', 'JOINED', 'STATUS', 'ACTION'].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider text-left ${
                    i === 1 ? 'hidden md:table-cell' : i === 3 ? 'hidden sm:table-cell' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-24" /></td>)}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=D4AF37&color=fff&size=40`}
                          alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-gray-100" />
                        <div>
                          <p className="text-gray-700 text-sm font-semibold">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.phone ? (
                        <span className="text-gray-500 text-sm flex items-center gap-1.5">
                          <FiPhone size={12} className="text-yellow-500" /> {user.phone}
                        </span>
                      ) : <span className="text-gray-300 text-xs">No phone</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit ${
                        user.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? <FiShield size={10} /> : <FiUser size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-400 text-xs">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Link to={`/admin/users/${user._id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="View Analytics">
                        <FiEye size={18} />
                      </Link>
                      <button onClick={() => handleToggleStatus(user._id)}
                        className={`p-2 rounded-lg transition-all ${
                          user.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                        }`} title={user.isActive ? 'Block User' : 'Activate User'}>
                        {user.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Permanently Delete User">
                          <FiTrash2 size={16} />
                        </button>
                      )}
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
    </AdminLayout>
  )
}

export default AdminUsers

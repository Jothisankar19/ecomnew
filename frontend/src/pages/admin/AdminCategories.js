import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag, FiUpload, FiLoader, FiImage, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import api from '../../utils/api'
import AdminLayout from '../../components/layout/AdminLayout'
import toast from 'react-hot-toast'

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all'

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

// ── Category Image Uploader ───────────────────────────────────
const CategoryImageUploader = ({ currentImage, onUpload, uploading }) => {
  const ref = useRef(null)
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Image</label>
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="w-24 h-24 rounded-2xl border-2 border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
          {currentImage ? (
            <img src={currentImage} alt="Category" className="w-full h-full object-cover" />
          ) : (
            <FiImage className="text-gray-300" size={28} />
          )}
        </div>
        {/* Upload button */}
        <div className="flex-1">
          <div
            onClick={() => !uploading && ref.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              uploading ? 'border-yellow-300 bg-yellow-50 cursor-wait' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/50'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <FiLoader className="text-yellow-500 animate-spin" size={18} />
                <p className="text-yellow-600 text-sm font-medium">Uploading...</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FiUpload className="text-gray-400" size={18} />
                <p className="text-gray-500 text-sm">{currentImage ? 'Change image' : 'Upload image'}</p>
              </div>
            )}
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
          </div>
          <p className="text-gray-400 text-xs mt-1.5">JPG, PNG, WEBP · Recommended 400×400px</p>
        </div>
      </div>
    </div>
  )
}

// ── Category Modal ────────────────────────────────────────────
const CategoryModal = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    slug: category?.slug || '',
    isActive: category?.isActive !== false,
  })
  const [imageUrl, setImageUrl] = useState(category?.image?.url || category?.image || '')
  const [imagePublicId, setImagePublicId] = useState(category?.image?.public_id || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleNameChange = (name) => {
    setForm({
      ...form,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('files', file)
      fd.append('folder', 'ethnic-elegance/categories')
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImageUrl(data.files[0].url)
      setImagePublicId(data.files[0].public_id)
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        ...(imageUrl && { image: { url: imageUrl, public_id: imagePublicId } }),
      }
      let res
      if (category?._id) {
        res = await api.put(`/categories/${category._id}`, payload)
        toast.success('Category updated!')
      } else {
        res = await api.post('/categories', payload)
        toast.success('Category created!')
      }
      onSave(res.data.category)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category')
    }
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.96, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-gray-800 font-bold text-lg">{category?._id ? 'Edit Category' : 'Add Category'}</h3>
            <p className="text-gray-400 text-xs mt-0.5">Kurti collection category</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Image & Status Toggle */}
            <div className="space-y-5">
              {/* Image Upload */}
              <CategoryImageUploader currentImage={imageUrl} onUpload={handleImageUpload} uploading={uploading} />
              
              {/* Active Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Visibility</label>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition-colors">
                  <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isActive ? 'bg-yellow-500' : 'bg-gray-300'}`}
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-700 text-sm font-semibold">Active Status</p>
                    <p className="text-gray-400 text-xs mt-0.5">Visible to customers in the catalog</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column: Name, Slug, Description */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)} className={inputCls} required placeholder="e.g. Anarkali Kurtis" />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Slug</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={`${inputCls} text-gray-500`} placeholder="auto-generated" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} resize-none`} rows={3} placeholder="Short description of this category..." />
              </div>
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
          <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || uploading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><FiLoader className="animate-spin" size={16} />Saving...</> : category?._id ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Admin Categories Page ─────────────────────────────────────
const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCategory, setModalCategory] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/categories?admin=true').then(({ data }) => {
      setCategories(data.categories || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in this category will be unassigned.')) return
    try {
      await api.delete(`/categories/${id}`)
      setCategories(categories.filter(c => c._id !== id))
      toast.success('Category deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
  }

  const handleSave = (saved) => {
    if (modalCategory?._id) setCategories(categories.map(c => c._id === saved._id ? saved : c))
    else setCategories([...categories, saved])
  }

  // Derived Category Counts
  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive !== false).length
  const inactiveCategories = categories.filter(c => c.isActive === false).length

  return (
    <AdminLayout>
      <Helmet><title>Categories — Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-400 text-sm">{categories.length} kurti collections</p>
        </div>
        <button onClick={() => { setModalCategory(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-yellow-200">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {/* ─── Summary Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={FiTag}
          label="Total Categories"
          value={totalCategories}
          subtext="Available collections"
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          delay={0}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Active Categories"
          value={activeCategories}
          subtext="Visible on storefront"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.05}
        />
        <StatCard
          icon={FiXCircle}
          label="Inactive Categories"
          value={inactiveCategories}
          subtext="Hidden from customers"
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
          delay={0.1}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FiTag className="text-gray-200 mx-auto mb-4" size={48} />
          <p className="text-gray-400 mb-4">No categories yet. Add your first kurti collection!</p>
          <button onClick={() => { setModalCategory(null); setShowModal(true) }} className="btn-primary text-sm">
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative h-36 bg-gradient-to-br from-yellow-50 to-amber-50 overflow-hidden">
                {cat.image?.url || cat.image ? (
                  <img src={cat.image?.url || cat.image} alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiTag className="text-yellow-300" size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Status badge */}
                <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                  cat.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-gray-800 font-bold mb-0.5">{cat.name}</h3>
                <p className="text-gray-400 text-xs mb-1">/{cat.slug}</p>
                {cat.description && <p className="text-gray-400 text-xs line-clamp-2 mb-3">{cat.description}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setModalCategory(cat); setShowModal(true) }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-yellow-600 hover:bg-yellow-50 border border-yellow-200 transition-all">
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(cat._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-200 transition-all">
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <CategoryModal
            category={modalCategory}
            onClose={() => { setShowModal(false); setModalCategory(null) }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default AdminCategories

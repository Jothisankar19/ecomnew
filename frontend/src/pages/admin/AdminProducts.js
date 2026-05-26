import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiUpload, FiCheck, FiImage, FiLoader, FiPackage, FiTrendingUp, FiAlertCircle, FiBox } from 'react-icons/fi'
import api from '../../utils/api'
import { formatPrice } from '../../utils/helpers'
import AdminLayout from '../../components/layout/AdminLayout'
import toast from 'react-hot-toast'

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all'

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

const ImageUploader = ({ images, onUpload, onRemove, uploading }) => {
  const ref = useRef(null)
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Images</label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.url} alt="" className="w-20 h-24 object-cover rounded-xl border-2 border-gray-100 shadow-sm" />
              {i === 0 && <span className="absolute -top-1.5 -left-1.5 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">Main</span>}
              <button type="button" onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FiX size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < 4 && (
        <div onClick={() => !uploading && ref.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploading ? 'border-yellow-300 bg-yellow-50 cursor-wait' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/50'}`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <FiLoader className="text-yellow-500 animate-spin" size={28} />
              <p className="text-yellow-600 text-sm font-medium">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FiUpload className="text-gray-400" size={22} />
              </div>
              <p className="text-gray-600 text-sm font-medium">Click to upload images ({images.length}/4)</p>
              <p className="text-gray-400 text-xs">JPG, PNG, WEBP · Max 4 images allowed</p>
            </div>
          )}
          <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={onUpload} disabled={uploading} />
        </div>
      )}
    </div>
  )
}

const emptyForm = {
  name: '', description: '', shortDescription: '', price: '', discountPrice: '',
  category: '', brand: '', fabric: '', stock: '',
  sizes: [], colors: [], features: [],
  isFeatured: false, isTrending: false, isNewArrival: false, isBestSeller: false,
}

// ── Category Picker with images ───────────────────────────────
const CategoryPicker = ({ categories, selected, onSelect }) => {
  if (!categories.length) return null
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Select Collection <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
        {categories.map(cat => {
          const img = cat.image?.url || cat.image
          const isSelected = selected === cat._id
          return (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelect(cat._id)}
              className={`relative overflow-hidden rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-yellow-500 shadow-md shadow-yellow-200'
                  : 'border-gray-100 hover:border-yellow-300'
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {img ? (
                  <img src={img} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50">
                    <span className="text-yellow-400 font-bold text-lg">{cat.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              {/* Label */}
              <div className={`px-1.5 py-1 ${isSelected ? 'bg-yellow-500' : 'bg-white'}`}>
                <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {cat.name}
                </p>
              </div>
              {/* Check mark */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow">
                  <FiCheck size={11} className="text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
      {selected && (
        <p className="text-yellow-600 text-xs font-medium mt-1.5">
          ✓ {categories.find(c => c._id === selected)?.name} selected
        </p>
      )}
    </div>
  )
}

const ProductModal = ({ product, categories, onClose, onSave }) => {
  const [form, setForm] = useState(product ? { ...product, category: product.category?._id || product.category || '' } : emptyForm)
  const [images, setImages] = useState(product?.images || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState({ name: '', hex: '#D4AF37' })
  const [featureInput, setFeatureInput] = useState('')

  // Auto-calculate final selling price
  useEffect(() => {
    const base = Number(form._basePrice || form.price || 0)
    const gst = Number(form.gstRate ?? 5)
    const delivery = Number(form.deliveryFee ?? 99)
    const final = Math.round(base + (base * gst / 100) + delivery)
    
    if (final !== Number(form.discountPrice)) {
      setForm(prev => ({ ...prev, discountPrice: final }))
    }
  }, [form._basePrice, form.price, form.gstRate, form.deliveryFee])

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed per product')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('folder', 'ethnic-elegance/products')
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImages(prev => [...prev, ...data.files.map(f => ({ public_id: f.public_id, url: f.url }))])
      toast.success(`${data.files.length} image(s) uploaded!`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed'
      if (msg.includes('Cloudinary') || msg.includes('not configured')) {
        toast.error('Cloudinary not set up. Add credentials to backend .env file.', { duration: 6000 })
      } else {
        toast.error(msg)
      }
    }
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { discountPercent, ...formToSave } = form
      const payload = { ...formToSave, images }
      const res = product?._id
        ? await api.put(`/products/${product._id}`, payload)
        : await api.post('/products', payload)
      toast.success(product?._id ? 'Product updated!' : 'Product created!')
      onSave(res.data.product)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  const addSize = () => {
    if (sizeInput.trim() && !form.sizes.find(s => s.size === sizeInput.trim())) {
      setForm({ ...form, sizes: [...form.sizes, { size: sizeInput.trim(), stock: 10 }] })
      setSizeInput('')
    }
  }
  const addColor = () => {
    if (colorInput.name.trim()) {
      setForm({ ...form, colors: [...form.colors, { ...colorInput }] })
      setColorInput({ name: '', hex: '#D4AF37' })
    }
  }
  const addFeature = () => {
    if (featureInput.trim()) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] })
      setFeatureInput('')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.96, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-gray-800 font-bold text-lg">{product?._id ? 'Edit Product' : 'Add New Product'}</h3>
            <p className="text-gray-400 text-xs mt-0.5">Fill in the product details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all">
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          <ImageUploader images={images} onUpload={handleImageUpload} onRemove={i => setImages(prev => prev.filter((_, idx) => idx !== i))} uploading={uploading} />

          {/* Visual category picker */}
          <CategoryPicker
            categories={categories}
            selected={form.category}
            onSelect={catId => setForm({ ...form, category: catId })}
          />

          <Field label="Product Name" required>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Floral Anarkali Kurti" required />
          </Field>

          {/* ── PRICING & INVENTORY ─────────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Pricing & Inventory</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })} 
                  className={`${inputCls} bg-slate-50/50 border-slate-100`}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Price (₹)</label>
                <input 
                  type="number" 
                  value={form._basePrice ?? form.price}
                  onChange={e => setForm({ ...form, _basePrice: e.target.value, price: e.target.value })} 
                  className={`${inputCls} bg-slate-50/50 border-slate-100`} 
                  placeholder="0.00" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tax (%) [GST]</label>
                <input 
                  type="number" 
                  value={form.gstRate ?? 5}
                  onChange={e => setForm({ ...form, gstRate: e.target.value })} 
                  className={`${inputCls} bg-slate-50/50 border-slate-100`} 
                  placeholder="0" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Delivery Fee (₹)</label>
                <input 
                  type="number" 
                  value={form.deliveryFee ?? 99}
                  onChange={e => setForm({ ...form, deliveryFee: e.target.value })} 
                  className={`${inputCls} bg-slate-50/50 border-slate-100`} 
                  placeholder="0" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Quantity</label>
                <input 
                  type="number" 
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })} 
                  className={`${inputCls} bg-slate-50/50 border-slate-100`} 
                  placeholder="0" 
                />
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-slate-50/30 rounded-3xl p-6 border border-slate-100/50 space-y-4">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400 font-medium">GST Amount ({form.gstRate ?? 5}%):</span>
                 <span className="text-slate-900 font-bold">₹{Math.round((Number(form._basePrice || form.price || 0)) * (Number(form.gstRate ?? 5) / 100))}</span>
              </div>
              
              <div className="h-px bg-slate-100 border-dashed border-t" />

              <div className="flex justify-between items-end">
                <div>
                   <p className="text-slate-400 font-medium text-sm">Final Selling Price:</p>
                   <p className="text-[10px] text-slate-300 italic mt-1">* Includes base price + GST + delivery charges</p>
                </div>
                <div className="text-right">
                   <p className="text-indigo-600 font-black text-3xl">
                     ₹{Math.round(
                       Number(form._basePrice || form.price || 0) + 
                       ((Number(form._basePrice || form.price || 0)) * (Number(form.gstRate ?? 5) / 100)) + 
                       Number(form.deliveryFee ?? 99)
                     )}
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock + Brand + Fabric */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Stock" required>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inputCls} placeholder="50" required min="0" />
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className={inputCls} placeholder="Brand name" />
            </Field>
            <Field label="Fabric">
              <input value={form.fabric} onChange={e => setForm({ ...form, fabric: e.target.value })} className={inputCls} placeholder="e.g. Cotton" />
            </Field>
          </div>

          <Field label="Short Description">
            <input value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className={inputCls} placeholder="Brief product description" />
          </Field>

          <Field label="Full Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} rows={3} placeholder="Detailed product description" />
          </Field>

          {/* Sizes */}
          <Field label="Sizes">
            <div className="flex gap-2 mb-2">
              <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} className={`${inputCls} flex-1`} placeholder="e.g. S, M, L, XL" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} />
              <button type="button" onClick={addSize} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.sizes.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {s.size}
                  <button type="button" onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, idx) => idx !== i) })} className="text-yellow-400 hover:text-red-500"><FiX size={11} /></button>
                </span>
              ))}
            </div>
          </Field>

          {/* Colors */}
          <Field label="Colors">
            <div className="flex gap-2 mb-2">
              <input value={colorInput.name} onChange={e => setColorInput({ ...colorInput, name: e.target.value })} className={`${inputCls} flex-1`} placeholder="Color name (e.g. Red)" />
              <input type="color" value={colorInput.hex} onChange={e => setColorInput({ ...colorInput, hex: e.target.value })} className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-1 bg-white" />
              <button type="button" onClick={addColor} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.colors.map((c, i) => (
                <span key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <span className="w-3 h-3 rounded-full border border-gray-300" style={{ background: c.hex }} />
                  {c.name}
                  <button type="button" onClick={() => setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) })} className="text-gray-400 hover:text-red-500"><FiX size={11} /></button>
                </span>
              ))}
            </div>
          </Field>

          {/* Features */}
          <Field label="Features">
            <div className="flex gap-2 mb-2">
              <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} className={`${inputCls} flex-1`} placeholder="Add a product feature" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
              <button type="button" onClick={addFeature} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors">Add</button>
            </div>
            <div className="space-y-1.5">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700">
                  <span className="flex items-center gap-2"><FiCheck size={13} className="text-green-500" />{f}</span>
                  <button type="button" onClick={() => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) })} className="text-gray-300 hover:text-red-500"><FiX size={13} /></button>
                </div>
              ))}
            </div>
          </Field>

          {/* Flags */}
          <Field label="Product Tags">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[['isFeatured', 'Featured'], ['isTrending', 'Trending'], ['isNewArrival', 'New Arrival'], ['isBestSeller', 'Best Seller']].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setForm({ ...form, [key]: !form[key] })}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${form[key] ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {form[key] ? <FiCheck size={12} className="text-yellow-500" /> : <div className="w-3 h-3 rounded border border-gray-300" />}
                  {label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
          <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || uploading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><FiLoader className="animate-spin" size={16} />Saving...</> : product?._id ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalProduct, setModalProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const limit = 12

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (search) params.search = search
      const { data } = await api.get('/products', { params })
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [page])
  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data.categories || [])) }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(p => p.filter(x => x._id !== id))
      toast.success('Product deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleSave = (saved) => {
    if (modalProduct?._id) setProducts(p => p.map(x => x._id === saved._id ? saved : x))
    else { setProducts(p => [saved, ...p]); setTotal(t => t + 1) }
  }

  const pages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <Helmet><title>Products — Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-400 text-sm">{total} total products</p>
        </div>
        <button onClick={() => { setModalProduct(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-yellow-200">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* ─── Summary Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Products',
            value: total,
            icon: <FiBox size={20} />,
            gradient: 'from-indigo-500 to-violet-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            text: 'text-indigo-600',
          },
          {
            label: 'In Stock',
            value: products.filter(p => p.stock > 0).length,
            icon: <FiPackage size={20} />,
            gradient: 'from-emerald-500 to-green-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-600',
          },
          {
            label: 'Out of Stock',
            value: products.filter(p => p.stock === 0).length,
            icon: <FiAlertCircle size={20} />,
            gradient: 'from-rose-500 to-red-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            text: 'text-rose-600',
          },
          {
            label: 'Trending',
            value: products.filter(p => p.isTrending).length,
            icon: <FiTrendingUp size={20} />,
            gradient: 'from-orange-500 to-amber-500',
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            text: 'text-orange-600',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
            className={`relative overflow-hidden ${card.bg} ${card.border} border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-default group`}
          >
            {/* Decorative gradient blob */}
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{card.label}</p>
              <p className={`text-2xl font-black ${card.text} leading-none mt-1`}>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchProducts()}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400" />
        </div>
        <button onClick={fetchProducts} className="bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">Search</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FiImage className="text-gray-200 mx-auto mb-3" size={48} />
          <p className="text-gray-400">No products found. Add your first kurti!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <motion.div key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative aspect-[3/4]">
                <img src={product.images?.[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => { setModalProduct(product); setShowModal(true) }} className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:bg-yellow-400 shadow-lg"><FiEdit2 size={16} /></button>
                  <button onClick={() => handleDelete(product._id)} className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 shadow-lg"><FiTrash2 size={16} /></button>
                </div>
                {product.stock === 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Out of Stock</span>}
                {product.isTrending && <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">🔥</span>}
              </div>
              <div className="p-3">
                <p className="text-gray-800 text-sm font-semibold line-clamp-1">{product.name}</p>
                <p className="text-gray-400 text-xs mb-1.5">{product.category?.name}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {product.discountPrice ? (
                      <><span className="text-yellow-600 font-bold text-sm">{formatPrice(product.discountPrice)}</span><span className="text-gray-300 text-xs line-through">{formatPrice(product.price)}</span></>
                    ) : <span className="text-yellow-600 font-bold text-sm">{formatPrice(product.price)}</span>}
                  </div>
                  <span className={`text-xs font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>{product.stock} left</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-yellow-400'}`}>{p}</button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ProductModal product={modalProduct} categories={categories}
            onClose={() => { setShowModal(false); setModalProduct(null) }} onSave={handleSave} />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default AdminProducts

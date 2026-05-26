import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiUpload, FiLoader, FiCheck, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import api from '../../utils/api'
import AdminLayout from '../../components/layout/AdminLayout'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCategories } from '../../store/slices/categorySlice'

const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all'

// ── Slide Image Uploader ───────────────────────────────────────
const SlideImageUploader = ({ currentImage, onUpload, uploading }) => {
  const ref = useRef(null)
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Image</label>
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="w-40 h-24 rounded-2xl border-2 border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
          {currentImage ? (
            <img src={currentImage} alt="Banner Preview" className="w-full h-full object-cover" />
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
                <p className="text-gray-500 text-sm">{currentImage ? 'Change Image' : 'Upload Slider Image'}</p>
              </div>
            )}
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
          </div>
          <p className="text-gray-400 text-xs mt-1.5">WEBP, JPG, PNG · Widescreen (e.g. 1920x800px or similar ratio)</p>
        </div>
      </div>
    </div>
  )
}

// ── Slide Modal ───────────────────────────────────────────────
// ── Slide Modal ───────────────────────────────────────────────
const SlideModal = ({ slide, onClose, onSave }) => {
  const { categories } = useSelector(state => state.categories)
  const [form, setForm] = useState({
    subtitle: slide?.subtitle || '',
    title: slide?.title || '',
    highlight: slide?.highlight || '',
    badge: slide?.badge || '',
    cta: slide?.cta || 'Shop Now',
    categoryId: slide?.categoryId?._id || slide?.categoryId || '',
    textPosition: slide?.textPosition || 'center',
    active: slide?.active !== false,
    order: slide?.order || 0,
  })
  const [imageUrl, setImageUrl] = useState(slide?.image?.url || '')
  const [imagePublicId, setImagePublicId] = useState(slide?.image?.public_id || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── Image Compressor States ──
  const [compressingFile, setCompressingFile] = useState(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [previewSrc, setPreviewSrc] = useState('')
  const [compressedBlob, setCompressedBlob] = useState(null)
  const [compressQuality, setCompressQuality] = useState(0.85)
  const [targetWidth, setTargetWidth] = useState(1920)
  const [stats, setStats] = useState({ original: 0, compressed: 0, w: 0, h: 0 })

  // Visual Cropper Shifts & Zooms
  const [zoom, setZoom] = useState(1.0)
  const [xShift, setXShift] = useState(0.0)
  const [yShift, setYShift] = useState(0.0)
  const [cropRatio, setCropRatio] = useState(2.2)
  const [padColor, setPadColor] = useState('#000000')

  const fileInputRef = useRef(null)

  // Trigger compression calculations on Canvas
  const runCompression = (img, widthLim, quality, origSize, z = zoom, xs = xShift, ys = yShift, cr = cropRatio, pc = padColor) => {
    const canvas = document.createElement('canvas')
    
    // The canvas is ALWAYS a perfect Widescreen 2.2:1 layout to prevent browser stretching
    const W = widthLim === 9999 ? img.naturalWidth : widthLim
    const H = Math.round(W / 2.2)

    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Compute dimensions of the crop area fitted inside the widescreen canvas
    let cropAreaW, cropAreaH
    if (cr >= 2.2) {
      cropAreaW = W
      cropAreaH = W / cr
    } else {
      cropAreaH = H
      cropAreaW = H * cr
    }

    const dx = (W - cropAreaW) / 2
    const dy = (H - cropAreaH) / 2

    // Compute source crop rectangle matching the aspect ratio
    const imgRatio = img.naturalWidth / img.naturalHeight
    const cropRatioVal = cr

    let sWidth, sHeight
    if (imgRatio > cropRatioVal) {
      sHeight = img.naturalHeight
      sWidth = img.naturalHeight * cropRatioVal
    } else {
      sWidth = img.naturalWidth
      sHeight = img.naturalWidth / cropRatioVal
    }

    // Apply Zoom factor scaling
    sWidth = sWidth / z
    sHeight = sHeight / z

    // Calculate source anchor offsets
    let sx = (img.naturalWidth - sWidth) / 2
    let sy = (img.naturalHeight - sHeight) / 2

    const maxShiftX = Math.abs(img.naturalWidth - sWidth) / 2
    const maxShiftY = Math.abs(img.naturalHeight - sHeight) / 2

    // Shift coordinates by input percentage
    sx += xs * maxShiftX * 2
    sy += ys * maxShiftY * 2

    // Dynamic bounds mapping to support both Zoom IN (cropping) and Zoom OUT (padding)
    let minSx, maxSx, minSy, maxSy;
    if (sWidth <= img.naturalWidth) { minSx = 0; maxSx = img.naturalWidth - sWidth; } 
    else { minSx = img.naturalWidth - sWidth; maxSx = 0; }
    
    if (sHeight <= img.naturalHeight) { minSy = 0; maxSy = img.naturalHeight - sHeight; } 
    else { minSy = img.naturalHeight - sHeight; maxSy = 0; }

    sx = Math.max(minSx, Math.min(maxSx, sx))
    sy = Math.max(minSy, Math.min(maxSy, sy))

    // Fill padding background with the selected custom color
    ctx.fillStyle = pc
    ctx.fillRect(0, 0, W, H)

    // Draw the crop area centered inside the widescreen canvas
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, cropAreaW, cropAreaH)

    // Update real-time cropped visual preview
    setPreviewSrc(canvas.toDataURL('image/jpeg', 0.85))

    canvas.toBlob((blob) => {
      if (!blob) return
      setCompressedBlob(blob)
      setStats({
        original: origSize,
        compressed: blob.size,
        w: W,
        h: H
      })
    }, 'image/jpeg', quality)
  }

  // Handle local image file load
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setOriginalSize(file.size)
    setZoom(1.0)
    setXShift(0.0)
    setYShift(0.0)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setCompressingFile(img)
        setPreviewSrc(event.target.result)
        runCompression(img, targetWidth, compressQuality, file.size, 1.0, 0.0, 0.0)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  // Live recalculations during slider adjustments
  useEffect(() => {
    if (compressingFile) {
      runCompression(compressingFile, targetWidth, compressQuality, originalSize, zoom, xShift, yShift, cropRatio, padColor)
    }
  }, [compressQuality, targetWidth, zoom, xShift, yShift, cropRatio, padColor])

  // Upload optimized blob to Cloudinary
  const handleOptimizedUpload = async () => {
    if (!compressedBlob) return
    setUploading(true)
    try {
      const fd = new FormData()
      const optimizedFile = new File([compressedBlob], 'optimized-banner.jpg', { type: 'image/jpeg' })
      fd.append('files', optimizedFile)
      fd.append('folder', 'ethnic-elegance/banners')

      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImageUrl(data.files[0].url)
      setImagePublicId(data.files[0].public_id)
      toast.success('Optimized HD banner uploaded!')
      setCompressingFile(null) // Close adjuster
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imageUrl) {
      return toast.error('Please upload a banner image')
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        image: { url: imageUrl, public_id: imagePublicId },
      }
      let res
      if (slide?._id) {
        res = await api.put(`/hero-slides/${slide._id}`, payload)
        toast.success('Banner updated!')
      } else {
        res = await api.post('/hero-slides', payload)
        toast.success('Banner created!')
      }
      onSave(res.data.slide)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save slide')
    }
    setSaving(false)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.96, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/80">
            <div>
              <h3 className="text-gray-800 font-bold text-lg">{slide?._id ? 'Edit Hero Banner' : 'Add Hero Banner'}</h3>
              <p className="text-gray-400 text-xs mt-0.5">Customize homepage hero slider</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all">
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Image Upload */}
            <SlideImageUploader currentImage={imageUrl} onUpload={handleFileSelect} uploading={uploading} />

            {/* Badge & Subtitle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Top Badge</label>
                <input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className={inputCls} placeholder="e.g. Flat 50% OFF" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subtitle Text</label>
                <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className={inputCls} placeholder="e.g. Flared & Embroidered" />
              </div>
            </div>

            {/* Main Title & Highlight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Main Title <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} required placeholder="e.g. Beautiful" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Highlight Title (Gold) <span className="text-red-500">*</span></label>
                <input value={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.value })} className={inputCls} required placeholder="e.g. Anarkali Kurtis" />
              </div>
            </div>

            {/* Call to Action Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button text (CTA)</label>
              <input value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })} className={inputCls} placeholder="e.g. Explore Now" />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Category <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {categories?.map(cat => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setForm({ ...form, categoryId: form.categoryId === cat._id ? '' : cat._id })}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                      form.categoryId === cat._id
                        ? 'bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-500/20'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Positioning Alignments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Overlay Text Alignment Position</label>
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                {[
                  { label: 'Left Align', val: 'left' },
                  { label: 'Center Align', val: 'center' },
                  { label: 'Right Align', val: 'right' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setForm({ ...form, textPosition: item.val })}
                    className={`py-2 px-2 text-center rounded-lg text-xs font-bold transition-all ${
                      form.textPosition === item.val
                        ? 'bg-yellow-500 text-white shadow-sm'
                        : 'bg-transparent text-gray-500 hover:text-gray-750 hover:bg-gray-200/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Order & Visibility status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Order Number</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className={inputCls} placeholder="e.g. 0" />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-[46px]">
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-yellow-500' : 'bg-gray-300'}`}
                    onClick={() => setForm({ ...form, active: !form.active })}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">Active Banner</span>
                </label>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
            <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={saving || uploading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><FiLoader className="animate-spin" size={16} />Saving...</> : slide?._id ? 'Update Slide' : 'Create Slide'}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Visual Compressor & Adjuster Dialog ── */}
      <AnimatePresence>
        {compressingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-50/40">
                <div>
                  <h4 className="text-gray-800 font-black text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                    Widescreen Banner Adjuster & Compressor
                  </h4>
                  <p className="text-gray-500 text-xs mt-0.5">Optimize banner dimension limits and compression weight live</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompressingFile(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Visual portion preview */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Adjusted Preview Area</label>
                  <div className="relative w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center shadow-inner" style={{ aspectRatio: cropRatio }}>
                    {previewSrc ? (
                      <img src={previewSrc} alt="Adjust preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage size={40} className="text-gray-600 animate-pulse" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {stats.w} × {stats.h} px
                    </span>
                  </div>
                </div>

                {/* Adjuster controls */}
                <div className="space-y-4">
                  {/* Aspect Ratio Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Target Aspect Ratio</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Widescreen (2.2:1)', val: 2.2 },
                        { label: 'Standard (16:9)', val: 1.777 },
                        { label: 'Classic (4:3)', val: 1.333 },
                        { label: 'Square (1:1)', val: 1.0 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setCropRatio(item.val)}
                          className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
                            cropRatio === item.val
                              ? 'bg-yellow-50 border-yellow-400 text-yellow-700 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas Padding Color */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Canvas Padding Color</label>
                    <div className="flex gap-3 items-center">
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                        <input
                          type="color"
                          value={padColor}
                          onChange={(e) => setPadColor(e.target.value)}
                          className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-xs font-mono font-bold text-gray-700">{padColor.toUpperCase()}</span>
                      </div>
                      <div className="flex gap-1.5 flex-1 justify-end">
                        {[
                          { label: 'Black', val: '#000000' },
                          { label: 'Cocoa', val: '#2b1d16' },
                          { label: 'Cream', val: '#faf6f0' },
                          { label: 'Grey', val: '#f5f5f7' },
                          { label: 'White', val: '#ffffff' }
                        ].map((color) => (
                          <button
                            key={color.val}
                            type="button"
                            onClick={() => setPadColor(color.val)}
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm relative hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.val }}
                            title={color.label}
                          >
                            {padColor === color.val && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-yellow-600">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Target scaling width */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Target Banner Scale (Width)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Full HD (1920px)', val: 1920 },
                        { label: 'Medium (1600px)', val: 1600 },
                        { label: 'Compact (1200px)', val: 1200 },
                        { label: 'Native Size', val: 9999 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setTargetWidth(item.val)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                            targetWidth === item.val
                              ? 'bg-yellow-50 border-yellow-400 text-yellow-700 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zoom slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Focal Zoom Scale</label>
                      <span className="text-yellow-700 text-xs font-black bg-yellow-50 px-2 py-0.5 rounded">
                        {zoom.toFixed(2)}x Zoom
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.20"
                      max="3.00"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>

                  {/* Horizontal & Vertical pan shifts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Horizontal Shift</label>
                        <span className="text-gray-500 text-xs font-semibold">
                          {xShift > 0 ? `+${Math.round(xShift * 200)}%` : `${Math.round(xShift * 200)}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-1.50"
                        max="1.50"
                        step="0.02"
                        value={xShift}
                        onChange={(e) => setXShift(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1">
                        <span>Left Crop</span>
                        <span>Center</span>
                        <span>Right Crop</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Vertical Shift</label>
                        <span className="text-gray-500 text-xs font-semibold">
                          {yShift > 0 ? `+${Math.round(yShift * 200)}%` : `${Math.round(yShift * 200)}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-1.50"
                        max="1.50"
                        step="0.02"
                        value={yShift}
                        onChange={(e) => setYShift(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1">
                        <span>Top Crop</span>
                        <span>Center</span>
                        <span>Bottom Crop</span>
                      </div>
                    </div>
                  </div>

                  {/* Quality slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Compression Quality</label>
                      <span className="text-yellow-700 text-xs font-black bg-yellow-50 px-2 py-0.5 rounded">
                        {Math.round(compressQuality * 100)}% Quality
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="1.00"
                      step="0.05"
                      value={compressQuality}
                      onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                      <span>Maximum Speed (10%)</span>
                      <span>Balanced (85%)</span>
                      <span>Max Quality (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Savings dashboard */}
                <div className="bg-gradient-to-br from-gray-50 to-stone-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">File Weight Analysis</p>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-gray-400 text-xs font-semibold block">Original</span>
                        <span className="text-gray-600 text-sm font-bold">{(stats.original / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="w-[1px] h-6 bg-gray-200" />
                      <div>
                        <span className="text-green-500 text-xs font-bold block">Optimized</span>
                        <span className="text-green-600 text-sm font-black">
                          {stats.compressed > 1024 * 1024
                            ? `${(stats.compressed / 1024 / 1024).toFixed(2)} MB`
                            : `${Math.round(stats.compressed / 1024)} KB`}
                        </span>
                      </div>
                    </div>
                  </div>
                  {stats.original > 0 && stats.compressed > 0 && (
                    <div className="text-right">
                      <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-md animate-pulse">
                        🔥 -{Math.round(((stats.original - stats.compressed) / stats.original) * 100)}% Smaller!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
                <button
                  type="button"
                  onClick={() => setCompressingFile(null)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOptimizedUpload}
                  disabled={uploading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      Optimizing & Uploading...
                    </>
                  ) : (
                    'Apply Optimized Image'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Promo & Occasion Banners Management ────────────────────────
const GenericBannersManager = ({ type }) => {
  const isPromo = type === 'promo';
  const { categories } = useSelector(state => state.categories)
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingIndex, setSavingIndex] = useState(null);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);

  // Always keep a ref to the latest banners so save never reads stale data
  const bannersRef = useRef(banners);
  useEffect(() => { bannersRef.current = banners; }, [banners]);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      const dbBanners = isPromo ? data.settings?.promoBanners : data.settings?.occasionBanners;

      // Normalize saved banners so categoryId is always a string id (not a populated object)
      const normalized = (dbBanners || []).map(b => ({
        ...b,
        categoryId: b?.categoryId?._id || b?.categoryId || ''
      }));

      // Initialize with normalized if exists, else fallback to 3 empty template slots
      let initial = [];
      if (normalized && normalized.length > 0) {
        initial = normalized;
      } else {
        initial = Array(3).fill(null).map(() => (
          isPromo 
            ? { img: null, tag: '', title: '', cta: '', categoryId: '' }
            : { img: null, badge: '', name: '', subtitle: '', desc: '', categoryId: '' }
        ));
      }
      setBanners(initial);
      setLoading(false);
    });
  }, [type]);

  const handleChange = (index, field, value) => {
    setBanners(prev => {
      const newBanners = [...prev];
      newBanners[index] = { ...newBanners[index], [field]: value };
      return newBanners;
    });
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageIndex(index);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('folder', 'ethnic-elegance/banners');

      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      handleChange(index, 'img', { url: data.files[0].url, public_id: data.files[0].public_id });
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Image upload failed');
    }
    setUploadingImageIndex(null);
  };

  const handleAddBanner = () => {
    setBanners(prev => [
      ...prev,
      isPromo 
        ? { img: null, tag: '', title: '', cta: '', categoryId: '' }
        : { img: null, badge: '', name: '', subtitle: '', desc: '', categoryId: '' }
    ]);
    toast.success('New banner card added at the bottom!');
  };

  const persistBanners = async (successMessage) => {
    setSaving(true);
    try {
      const latestBanners = bannersRef.current;
      const cleaned = latestBanners.map(b => ({
        ...b,
        categoryId: b.categoryId === '' ? null : b.categoryId
      }));
      const payload = isPromo ? { promoBanners: cleaned } : { occasionBanners: cleaned };
      await api.put('/settings', payload);
      setBanners(latestBanners);
      if (successMessage) toast.success(successMessage);
    } catch (err) {
      toast.error('Failed to save banners settings');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (index) => {
    if (!window.confirm('Are you sure you want to remove this banner card?')) return;
    const next = bannersRef.current.filter((_, i) => i !== index);
    setBanners(next);
    bannersRef.current = next;
    try {
      await persistBanners('Banner card removed!');
    } catch {
      /* toast shown in persistBanners */
    }
  };

  const handleMoveBanner = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const copy = [...bannersRef.current];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setBanners(copy);
    bannersRef.current = copy;
    try {
      await persistBanners('Banner order updated!');
    } catch {
      /* toast shown in persistBanners */
    }
  };

  const handleSaveSingle = async (index) => {
    setSavingIndex(index);
    try {
      await persistBanners(`${isPromo ? 'Promo' : 'Occasion'} Banner #${index + 1} updated successfully!`);
    } catch {
      toast.error(`Failed to update Banner #${index + 1}`);
    }
    setSavingIndex(null);
  };

  const getCardLabel = (index) => {
    const base = isPromo ? 'Promo Banner' : 'Occasion Banner';
    if (index === 0) return `${base} 1 — Left Card`;
    if (index === 1) return `${base} 2 — Center Card`;
    if (index === 2) return `${base} 3 — Right Card`;
    return `${base} ${index + 1}`;
  };

  if (loading) return <div className="p-8 text-center"><FiLoader className="animate-spin mx-auto text-yellow-500" size={24} /></div>;

  return (
    <div className="space-y-6">
      {/* Dynamic Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-3xl border border-yellow-500/10 backdrop-blur-sm shadow-sm">
        <div>
          <h3 className="text-gray-800 font-extrabold text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
            {isPromo ? 'Promo Banners Layout' : 'Occasion Banners Layout'}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            Currently managing {banners.length} dynamic banner {banners.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <button
          onClick={handleAddBanner}
          disabled={saving}
          className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-yellow-400 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60"
        >
          <FiPlus size={14} className="text-yellow-600" /> Add Banner Card
        </button>
      </div>

      {/* Cards list with beautiful Framer Motion drag/layout animations */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {banners.map((banner, i) => {
            const isUploading = uploadingImageIndex === i;
            const hasImage = !!(typeof banner.img === 'string' ? banner.img : banner.img?.url);

            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{getCardLabel(i)}</h4>
                      <p className="text-xs text-gray-400">{hasImage ? '✓ Image uploaded' : '⚠ No image yet'}</p>
                    </div>
                  </div>
                  
                  {/* Card Header Controls */}
                  <div className="flex items-center gap-3">
                    {/* Reorder Arrows */}
                    <div className="flex border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => handleMoveBanner(i, -1)}
                        disabled={i === 0 || saving}
                        className="p-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Move Banner Up"
                      >
                        <FiArrowUp size={14} />
                      </button>
                      <div className="w-[1px] bg-gray-100" />
                      <button
                        onClick={() => handleMoveBanner(i, 1)}
                        disabled={i === banners.length - 1 || saving}
                        className="p-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Move Banner Down"
                      >
                        <FiArrowDown size={14} />
                      </button>
                    </div>

                    {/* Save / Update Card Button */}
                    <button
                      onClick={() => handleSaveSingle(i)}
                      disabled={saving || savingIndex === i || isUploading}
                      className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${
                        savingIndex === i
                          ? 'bg-gray-200 text-gray-400 cursor-wait'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-yellow-250/20'
                      }`}
                      title="Save / Update Card"
                    >
                      {savingIndex === i ? <FiLoader className="animate-spin" size={13} /> : <FiCheck size={13} />}
                      {savingIndex === i ? 'Updating...' : 'Update Card'}
                    </button>

                    {/* Delete Card Button */}
                    <button
                      onClick={() => handleDeleteBanner(i)}
                      disabled={saving}
                      className="w-8.5 h-8.5 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-200/40 shadow-sm transition-colors disabled:opacity-40"
                      title="Remove Banner Card"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    <SlideImageUploader
                      currentImage={typeof banner.img === 'string' ? banner.img : banner.img?.url}
                      onUpload={(e) => handleImageUpload(e, i)}
                      uploading={isUploading}
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {isPromo ? (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tag (e.g. New Arrivals)</label>
                          <input value={banner.tag || ''} onChange={e => handleChange(i, 'tag', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title (Multiline supported)</label>
                          <input value={banner.title || ''} onChange={e => handleChange(i, 'title', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Text (CTA)</label>
                          <input value={banner.cta || ''} onChange={e => handleChange(i, 'cta', e.target.value)} className={inputCls} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Badge (e.g. Daily Staples)</label>
                          <input value={banner.badge || ''} onChange={e => handleChange(i, 'badge', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subtitle</label>
                          <input value={banner.subtitle || ''} onChange={e => handleChange(i, 'subtitle', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                          <input value={banner.name || ''} onChange={e => handleChange(i, 'name', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                          <input value={banner.desc || ''} onChange={e => handleChange(i, 'desc', e.target.value)} className={inputCls} />
                        </div>
                      </>
                    )}
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Category</label>
                      <div className="flex flex-wrap gap-2">
                        {(categories || []).map(cat => (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => handleChange(i, 'categoryId', banner.categoryId === cat._id ? '' : cat._id)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                              banner.categoryId === cat._id
                                ? 'bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-500/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

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

const PromoBannersManager = () => <GenericBannersManager type="promo" />;
const OccasionBannersManager = () => <GenericBannersManager type="occasion" />;

const AdminBanners = () => {
  const [activeTab, setActiveTab] = useState('hero')
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalSlide, setModalSlide] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [settingsCounts, setSettingsCounts] = useState({ promo: 0, occasion: 0 })
  const dispatch = useDispatch()

  const fetchSlides = () => {
    setLoading(true)
    api.get('/hero-slides/all')
      .then(({ data }) => {
        setSlides(data.slides || [])
        setLoading(false)
      })
      .catch((err) => {
        toast.error('Failed to load slides')
        setLoading(false)
      })
  }

  const fetchSettings = () => {
    api.get('/settings')
      .then(({ data }) => {
        setSettingsCounts({
          promo: data.settings?.promoBanners?.length || 0,
          occasion: data.settings?.occasionBanners?.length || 0
        })
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchSlides()
    fetchSettings()
    dispatch(fetchCategories())
  }, [activeTab]) // Re-fetch on tab change to sync any updates

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero slider banner?')) return
    try {
      await api.delete(`/hero-slides/${id}`)
      setSlides(slides.filter(s => s._id !== id))
      toast.success('Slide banner deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete slide banner')
    }
  }

  const handleActiveToggle = async (id) => {
    try {
      const { data } = await api.patch(`/hero-slides/${id}/active`)
      setSlides(slides.map(s => s._id === id ? data.slide : s))
      toast.success(data.slide.active ? 'Slide activated!' : 'Slide deactivated!')
    } catch (err) {
      toast.error('Failed to toggle status')
    }
  }

  const handleSave = (saved) => {
    if (modalSlide?._id) {
      setSlides(slides.map(s => s._id === saved._id ? saved : s).sort((a, b) => a.order - b.order))
    } else {
      setSlides([...slides, saved].sort((a, b) => a.order - b.order))
    }
  }

  const handleMove = async (index, direction) => {
    const newSlides = [...slides]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newSlides.length) return

    // Swap ordering numbers
    const tempOrder = newSlides[index].order
    newSlides[index] = { ...newSlides[index], order: newSlides[targetIndex].order }
    newSlides[targetIndex] = { ...newSlides[targetIndex], order: tempOrder }

    // Swap array positions
    const temp = newSlides[index]
    newSlides[index] = newSlides[targetIndex]
    newSlides[targetIndex] = temp

    setSlides(newSlides)

    try {
      const orderings = newSlides.map((s, idx) => ({ id: s._id, order: idx }))
      await api.put('/hero-slides/order', { orderings })
    } catch (err) {
      toast.error('Failed to save display ordering')
      fetchSlides() // Reset
    }
  }

  const activeSlides = slides.filter(s => s.active !== false).length

  return (
    <AdminLayout>
      <Helmet><title>Homepage Banners — Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Homepage Sections</h1>
          <p className="text-gray-400 text-sm">Customize the homepage layout and banners</p>
        </div>
        {activeTab === 'hero' && (
          <button onClick={() => { setModalSlide(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-yellow-200">
            <FiPlus size={16} /> Add Hero Banner
          </button>
        )}
      </div>

      {/* ─── Summary Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={FiPlus}
          label="Hero Slider"
          value={slides.length}
          subtext={`${activeSlides} active / ${slides.length - activeSlides} hidden`}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          delay={0}
        />
        <StatCard
          icon={FiImage}
          label="Promo Banners"
          value={settingsCounts.promo}
          subtext="Main layout grids"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.05}
        />
        <StatCard
          icon={FiImage}
          label="Occasion Banners"
          value={settingsCounts.occasion}
          subtext="Thematic collections"
          gradient="bg-gradient-to-br from-rose-500 to-red-600"
          delay={0.1}
        />
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-100 pb-2">
        {[
          { id: 'hero', label: 'Hero Slider' },
          { id: 'promo', label: 'Promo Banners' },
          { id: 'occasion', label: 'Occasion Banners' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-bold text-sm px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'hero' && (
        <>
          {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <FiImage className="text-gray-200 mx-auto mb-4 animate-pulse" size={54} />
          <h3 className="text-gray-700 font-bold text-lg mb-1">No Custom Banners Yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-5">The homepage is currently displaying default fallback slider collections. Upload your custom graphics!</p>
          <button onClick={() => { setModalSlide(null); setShowModal(true) }} className="btn-primary text-sm">
            Add Hero Banner
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, i) => (
            <motion.div
              key={slide._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-5 flex flex-col md:flex-row gap-5 items-stretch group hover:shadow-md hover:border-gray-200/65 transition-all"
            >
              {/* Slide image preview */}
              <div className="relative w-full md:w-80 h-44 md:h-auto rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                <img src={slide.image?.url} alt="Slider" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
                <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  slide.active ? 'bg-green-500 text-white shadow-sm' : 'bg-red-500 text-white'
                }`}>
                  {slide.active ? 'Active' : 'Inactive'}
                </span>
                
                {/* Embedded dynamic slide text preview */}
                <div className="absolute bottom-3 left-4 text-left pointer-events-none">
                  {slide.badge && <span className="inline-block text-[7px] font-bold text-white bg-yellow-500/90 px-2 py-0.5 rounded-full uppercase tracking-widest mb-1">{slide.badge}</span>}
                  <h4 className="text-white font-bold text-sm tracking-wide leading-tight">{slide.title}</h4>
                  <h4 className="text-yellow-400 font-bold text-sm tracking-wide leading-tight">{slide.highlight}</h4>
                </div>
              </div>

              {/* Specs & Info */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Slide #{i + 1} (Order: {slide.order})
                    </span>
                    {slide.subtitle && <span className="text-gray-400 text-xs font-medium">Subtitle: "{slide.subtitle}"</span>}
                  </div>
                  <h3 className="text-gray-800 font-bold text-lg mb-1">{slide.title} <span className="text-yellow-600">{slide.highlight}</span></h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><span className="font-semibold text-gray-700">Button CTA:</span> {slide.cta || 'Shop Now'}</p>
                    <p><span className="font-semibold text-gray-700">Button Link Route:</span> <code className="bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-600">{slide.link || '/products'}</code></p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 mt-4">
                  {/* Active toggle */}
                  <button onClick={() => handleActiveToggle(slide._id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      slide.active
                        ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                        : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                    <FiCheck size={13} /> {slide.active ? 'Set Inactive' : 'Set Active'}
                  </button>

                  {/* Edit */}
                  <button onClick={() => { setModalSlide(slide); setShowModal(true) }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-yellow-600 hover:bg-yellow-50 border border-yellow-200 transition-all">
                    <FiEdit2 size={13} /> Edit Banners
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(slide._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 border border-red-200 transition-all">
                    <FiTrash2 size={13} /> Delete
                  </button>

                  {/* Ordering arrows */}
                  <div className="flex gap-1 ml-auto border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleMove(i, -1)}
                      disabled={i === 0}
                      className="p-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move slide up"
                    >
                      <FiArrowUp size={14} />
                    </button>
                    <div className="w-[1px] bg-gray-100" />
                    <button
                      onClick={() => handleMove(i, 1)}
                      disabled={i === slides.length - 1}
                      className="p-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move slide down"
                    >
                      <FiArrowDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </>
    )}

      {activeTab === 'promo' && <PromoBannersManager />}
      {activeTab === 'occasion' && <OccasionBannersManager />}

      <AnimatePresence>
        {showModal && (
          <SlideModal
            slide={modalSlide}
            onClose={() => { setShowModal(false); setModalSlide(null) }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default AdminBanners

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FiPlus, FiEdit2, FiTrash2, FiX, FiPercent, FiCopy, FiCheck, 
  FiClock, FiTrendingUp, FiSettings, FiTag, FiZap, FiGrid, FiUpload,
  FiImage, FiLoader
} from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import AdminLayout from '../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const emptyCoupon = {
  code: '',
  autoGenerate: false,
  prefix: 'SAVE',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  validFrom: '',
  validUntil: '',
  isActive: true,
  isFestivalPromo: false,
  showBanner: false,
  bannerText: '',
  bannerImage: '',
  applicableCategories: [],
  applicableProducts: []
};

// ── Unified Premium Coupon & Flash Voucher Modal (Wide Card Redesign) ──
const CouponModal = ({ coupon, onClose, onSave }) => {
  // Helper to convert date to local ISO format for datetime-local input
  const toLocalISOString = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState(coupon ? {
    ...emptyCoupon,
    ...coupon,
    autoGenerate: false,
    validFrom: toLocalISOString(coupon.validFrom),
    validUntil: toLocalISOString(coupon.validUntil || coupon.expiresAt)
  } : emptyCoupon);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || []));
    api.get('/products?limit=100').then(({ data }) => setProducts(data.products || []));
  }, []);

  const [uploadingImage, setUploadingImage] = useState(false);

  // ── Visual Image Compressor States ──
  const [compressingFile, setCompressingFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [previewSrc, setPreviewSrc] = useState('');
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [compressQuality, setCompressQuality] = useState(0.85);
  const [targetWidth, setTargetWidth] = useState(1200); // Widescreen banner optimized
  const [stats, setStats] = useState({ original: 0, compressed: 0, w: 0, h: 0 });

  // Visual Shifts & Zooms
  const [zoom, setZoom] = useState(1.0);
  const [xShift, setXShift] = useState(0.0);
  const [yShift, setYShift] = useState(0.0);
  const [cropRatio, setCropRatio] = useState(2.2);
  const [padColor, setPadColor] = useState('#000000');

  // Canvas-based real-time compressor & visual crop shift engine
  const runCompression = (img, widthLim, quality, origSize, z = zoom, xs = xShift, ys = yShift, cr = cropRatio, pc = padColor) => {
    const canvas = document.createElement('canvas');
    
    // The canvas is ALWAYS a perfect Widescreen 2.2:1 layout to prevent browser stretching
    const W = widthLim === 9999 ? img.naturalWidth : widthLim;
    const H = Math.round(W / 2.2);

    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Compute dimensions of the crop area fitted inside the widescreen canvas
    let cropAreaW, cropAreaH;
    if (cr >= 2.2) {
      cropAreaW = W;
      cropAreaH = W / cr;
    } else {
      cropAreaH = H;
      cropAreaW = H * cr;
    }

    const dx = (W - cropAreaW) / 2;
    const dy = (H - cropAreaH) / 2;

    // Compute source crop rectangle matching the aspect ratio
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const cropRatioVal = cr;

    let sWidth, sHeight;
    if (imgRatio > cropRatioVal) {
      sHeight = img.naturalHeight;
      sWidth = img.naturalHeight * cropRatioVal;
    } else {
      sWidth = img.naturalWidth;
      sHeight = img.naturalWidth / cropRatioVal;
    }

    // Apply Zoom factor scaling
    sWidth = sWidth / z;
    sHeight = sHeight / z;

    // Calculate source anchor offsets
    let sx = (img.naturalWidth - sWidth) / 2;
    let sy = (img.naturalHeight - sHeight) / 2;

    const maxShiftX = Math.abs(img.naturalWidth - sWidth) / 2;
    const maxShiftY = Math.abs(img.naturalHeight - sHeight) / 2;

    // Shift coordinates by input percentage
    sx += xs * maxShiftX * 2;
    sy += ys * maxShiftY * 2;

    // Dynamic bounds mapping to support both Zoom IN (cropping) and Zoom OUT (padding)
    let minSx, maxSx, minSy, maxSy;
    if (sWidth <= img.naturalWidth) { minSx = 0; maxSx = img.naturalWidth - sWidth; } 
    else { minSx = img.naturalWidth - sWidth; maxSx = 0; }
    
    if (sHeight <= img.naturalHeight) { minSy = 0; maxSy = img.naturalHeight - sHeight; } 
    else { minSy = img.naturalHeight - sHeight; maxSy = 0; }

    sx = Math.max(minSx, Math.min(maxSx, sx));
    sy = Math.max(minSy, Math.min(maxSy, sy));

    // Fill padding background with custom selected color
    ctx.fillStyle = pc;
    ctx.fillRect(0, 0, W, H);

    // Draw the crop area centered inside the widescreen canvas
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, cropAreaW, cropAreaH);

    setPreviewSrc(canvas.toDataURL('image/jpeg', 0.85));

    canvas.toBlob((blob) => {
      if (!blob) return;
      setCompressedBlob(blob);
      setStats({
        original: origSize,
        compressed: blob.size,
        w: W,
        h: H
      });
    }, 'image/jpeg', quality);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    setZoom(1.0);
    setXShift(0.0);
    setYShift(0.0);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCompressingFile(img);
        setPreviewSrc(event.target.result);
        runCompression(img, targetWidth, compressQuality, file.size, 1.0, 0.0, 0.0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (compressingFile) {
      runCompression(compressingFile, targetWidth, compressQuality, originalSize, zoom, xShift, yShift, cropRatio, padColor);
    }
  }, [compressQuality, targetWidth, zoom, xShift, yShift, cropRatio, padColor]);

  const handleOptimizedUpload = async () => {
    if (!compressedBlob) return;
    setUploadingImage(true);
    try {
      const file = new File([compressedBlob], 'optimized-coupon-banner.jpg', { type: 'image/jpeg' });
      const fd = new FormData();
      fd.append('files', file);
      fd.append('folder', 'ethnic-elegance/coupons');
      
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, bannerImage: data.files[0].url }));
      toast.success('Optimized banner image uploaded!');
      setCompressingFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploadingImage(false);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(prev => ({ ...prev, code: `${prev.prefix || 'SAVE'}${code}`.toUpperCase() }));
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('folder', 'ethnic-elegance/coupons');
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, bannerImage: data.files[0].url }));
      toast.success('Banner image uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Format dates to ISO before sending
    const payload = {
      ...form,
      code: form.autoGenerate ? undefined : form.code.toUpperCase(),
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      expiresAt: form.validUntil ? new Date(form.validUntil).toISOString() : undefined
    };

    try {
      let res;
      if (coupon?._id) {
        res = await api.put(`/coupons/${coupon._id}`, payload);
        toast.success('Coupon updated successfully!');
      } else {
        res = await api.post('/coupons', payload);
        toast.success('Coupon created & scheduled successfully!');
      }
      onSave(res.data.coupon);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 w-full max-w-5xl my-8 shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiZap className="text-yellow-600 animate-bounce" size={22} />
            <h3 className="text-gray-900 font-extrabold text-xl">
              {coupon?._id ? 'Edit Coupon Campaign' : 'Configure Coupon & Flash Offer'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <FiX size={20} />
          </button>
        </div>
        
        {/* Form Body - Wide Side-by-Side Dual Column Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar">
          
          {/* Left Column: Basic Configurations */}
          <div className="space-y-4 pr-0 lg:pr-2 border-r-0 lg:border-r border-gray-100">
            <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block pb-1 border-b border-gray-50">Campaign Specifications</span>

            {/* Auto-generate code blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Auto-Generate Code?</label>
                <select
                  value={form.autoGenerate ? 'yes' : 'no'}
                  onChange={(e) => setForm({ ...form, autoGenerate: e.target.value === 'yes' })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-900 text-sm font-semibold transition-all"
                >
                  <option value="no">No (Use Custom Code)</option>
                  <option value="yes">Yes (Auto-Generate Unique Code)</option>
                </select>
              </div>

              {form.autoGenerate ? (
                <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Coupon Prefix</label>
                  <input
                    value={form.prefix}
                    onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-900 text-sm font-semibold transition-all"
                    placeholder="e.g. SAVE"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Voucher Code *</label>
                  <div className="flex gap-2">
                    <input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-900 font-mono tracking-widest text-sm uppercase transition-all"
                      placeholder="e.g. WELCOME10"
                      required={!form.autoGenerate}
                    />
                    <button type="button" onClick={generateRandomCode} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 rounded-xl transition-colors">Generate</button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Offer Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-sm transition-all"
                placeholder="e.g. Special 20% OFF - Limited claims only!"
                required
              />
            </div>

            {/* Discount Configuration (Type, Value, Quota) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Discount Type</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-sm font-semibold transition-all"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">
                  {form.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                </label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-sm font-semibold transition-all"
                  placeholder={form.discountType === 'percentage' ? 'e.g. 20 for 20%' : 'e.g. 250 for ₹250'}
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Max Claims Quota</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-sm transition-all"
                  placeholder="e.g. 100 claims"
                  min="1"
                />
              </div>
            </div>

            {/* Scheduled Datetimes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Start Time (validFrom)</label>
                <input
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-xs transition-all"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">End Time (validUntil)</label>
                <input
                  type="datetime-local"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-xs transition-all"
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Min Cart Value (₹)</label>
                <input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-sm transition-all"
                  placeholder="e.g. 2000"
                  min="0"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Max Discount Limit (₹)</label>
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-yellow-500 focus:bg-white text-gray-900 text-sm transition-all"
                  placeholder="No limit"
                  min="0"
                />
              </div>
            </div>

            {/* Status and Active Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-yellow-500 rounded"
                />
                <span className="text-gray-600 text-sm font-semibold">Active & Enabled</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  checked={form.showBanner}
                  onChange={(e) => setForm({ ...form, showBanner: e.target.checked })}
                  className="w-4 h-4 accent-yellow-500 rounded"
                />
                <span className="text-gray-600 text-sm font-semibold">Display Banner on Home</span>
              </label>
            </div>

            {form.showBanner && (
              <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100/60 space-y-3">
                <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest block">Client Banner Visuals</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Banner Headline / Subtext</label>
                    <input
                      value={form.bannerText}
                      onChange={(e) => setForm({ ...form, bannerText: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 text-gray-900 text-xs transition-all font-semibold"
                      placeholder="e.g. 50% Category Clearance Sale - Ends Soon!"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5 block">Banner Cover Image</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        {form.bannerImage ? (
                          <img src={form.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-300 text-xs font-semibold">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className={`flex items-center justify-center gap-2 border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                          uploadingImage ? 'border-yellow-300 bg-yellow-50/50 cursor-wait' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/20'
                        }`}>
                          <FiUpload className="text-gray-400" size={16} />
                          <span className="text-gray-600 text-xs font-bold uppercase tracking-wide">
                            {uploadingImage ? 'Uploading...' : form.bannerImage ? 'Change Image' : 'Select Local File'}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileSelect} 
                            disabled={uploadingImage} 
                          />
                        </label>
                        <p className="text-gray-400 text-[10px] font-bold mt-1.5 uppercase tracking-wider">WEBP, JPG, PNG recommended (Widescreen 950x340px)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Targeting & Pricing Intelligence */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block pb-1 border-b border-gray-50">Targeting & Pricing Intelligence</span>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Applicable Category</label>
                  <select
                    value={form.applicableCategories?.[0] || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setForm({ 
                          ...form, 
                          applicableCategories: [e.target.value],
                          applicableProducts: [] // Reset products targeting on category change
                        });
                      } else {
                        setForm({ 
                          ...form, 
                          applicableCategories: [],
                          applicableProducts: [] 
                        });
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-900 text-xs transition-all font-semibold"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 block">Festival Promo Tag</label>
                  <select
                    value={form.isFestivalPromo ? 'yes' : 'no'}
                    onChange={(e) => setForm({ ...form, isFestivalPromo: e.target.value === 'yes' })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-900 text-xs transition-all font-semibold"
                  >
                    <option value="no">Normal Coupon</option>
                    <option value="yes">Festival Special Promo</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Category Products checklist */}
              {(() => {
                const selectedCategoryId = form.applicableCategories?.[0] || '';
                const filteredProducts = selectedCategoryId 
                  ? products.filter(p => {
                      const pCatId = p.category?._id || p.category || '';
                      return pCatId.toString() === selectedCategoryId.toString();
                    })
                  : [];

                if (!selectedCategoryId) return null;

                return (
                  <div className="bg-white p-3.5 rounded-xl border border-gray-150 space-y-2">
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-wider block">
                      Targeted Products ({filteredProducts.length} items found)
                    </label>
                    {filteredProducts.length === 0 ? (
                      <p className="text-gray-400 text-xs font-semibold">No products found in this category.</p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 no-scrollbar mt-1">
                        {filteredProducts.map(prod => {
                          const isSelected = form.applicableProducts.includes(prod._id);
                          const origPrice = prod.discountPrice || prod.price;
                          const cogs = prod.price * 0.50; // Assumed 50% fashion COGS
                          const val = Number(form.discountValue) || 0;
                          
                          let pDiscount = 0;
                          if (val > 0) {
                            if (form.discountType === 'percentage') {
                              pDiscount = (origPrice * val) / 100;
                            } else {
                              pDiscount = val;
                            }
                          }
                          
                          const finalPrice = Math.max(0, Math.round(origPrice - pDiscount));
                          const profit = Math.round(finalPrice - cogs);
                          const marginPercent = finalPrice > 0 ? Math.round((profit / finalPrice) * 100) : -100;
                          const isLoss = profit < 0;
                          const isThin = !isLoss && profit <= (origPrice * 0.1);

                          return (
                            <div key={prod._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                              <label className="flex items-center gap-2.5 cursor-pointer select-none flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setForm({
                                        ...form,
                                        applicableProducts: form.applicableProducts.filter(id => id !== prod._id)
                                      });
                                    } else {
                                      setForm({
                                        ...form,
                                        applicableProducts: [...form.applicableProducts, prod._id]
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 accent-yellow-500 rounded border-gray-300"
                                />
                                <div className="flex flex-col">
                                  <span className="text-gray-900 text-xs font-bold truncate max-w-[170px]">{prod.name}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    Retail: ₹{prod.price} {prod.discountPrice ? `(Sale: ₹${prod.discountPrice})` : ''}
                                  </span>
                                </div>
                              </label>

                              <div className="flex items-center gap-2.5 flex-shrink-0 self-end sm:self-auto">
                                <div className="text-right">
                                  <span className="text-gray-900 text-xs font-black block">Proj: ₹{finalPrice}</span>
                                  <span className="text-[9px] text-gray-400 block font-medium">Cost: ₹{cogs}</span>
                                </div>

                                <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                                  isLoss 
                                    ? 'bg-red-50 border border-red-100 text-red-600' 
                                    : isThin 
                                      ? 'bg-yellow-50 border border-yellow-100 text-yellow-600' 
                                      : 'bg-green-50 border border-green-100 text-green-600'
                                }`}>
                                  {isLoss 
                                    ? `Loss: -₹${Math.abs(profit)}` 
                                    : `Profit: +₹${profit}`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Gross Category Health Summary Card */}
              {(() => {
                const selectedCategoryId = form.applicableCategories?.[0] || '';
                const filteredProducts = selectedCategoryId 
                  ? products.filter(p => {
                      const pCatId = p.category?._id || p.category || '';
                      return pCatId.toString() === selectedCategoryId.toString();
                    })
                  : [];

                if (!selectedCategoryId || filteredProducts.length === 0) return null;

                const analysis = filteredProducts.map(prod => {
                  const origPrice = prod.discountPrice || prod.price;
                  const cogs = prod.price * 0.50;
                  const val = Number(form.discountValue) || 0;
                  let pDiscount = 0;
                  if (val > 0) {
                    if (form.discountType === 'percentage') pDiscount = (origPrice * val) / 100;
                    else pDiscount = val;
                  }
                  const finalPrice = Math.max(0, origPrice - pDiscount);
                  return finalPrice - cogs;
                });

                const lossCount = analysis.filter(p => p < 0).length;
                const averageMargin = Math.round(analysis.reduce((sum, p) => sum + p, 0) / analysis.length);

                return (
                  <div className="mt-2 p-3 bg-white rounded-xl border border-gray-150 space-y-1.5 shadow-sm">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Gross Category Health Advisory</span>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {lossCount > 0 ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        ) : (
                          <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-[10px] font-semibold leading-relaxed">
                        {lossCount > 0 ? (
                          <span className="text-red-600 font-extrabold">🚨 Warning: {lossCount} items will sell at a loss! </span>
                        ) : (
                          <span className="text-green-600 font-extrabold">✅ Margin Safe: </span>
                        )}
                        Average projected profit is <strong className="text-gray-900">₹{averageMargin}</strong> per unit.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Bottom Actions Row (Spans full width) */}
          <div className="col-span-1 lg:col-span-2 flex gap-3 pt-4 border-t border-gray-100 mt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2">
              <FiZap /> {loading ? 'Scheduling...' : 'Save Promotion'}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex-1 text-sm rounded-2xl transition-colors">Cancel</button>
          </div>
        </form>

        {/* ── Visual Compressor & Adjuster Workspace Overlay ── */}
        <AnimatePresence>
          {compressingFile && (
            <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#151515] border border-neutral-800 rounded-3xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <FiImage className="text-yellow-500" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-base">Widescreen Image Alignment & Compressor Workspace</h4>
                      <p className="text-neutral-400 text-xs">Adjust image scale, horizontal & vertical shifts, and verify file size savings</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompressingFile(null)}
                    className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Workspace Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start text-left">
                  {/* Left side: Live projection preview */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black tracking-widest text-yellow-500 uppercase block">Projected Live Crop Area</span>
                    <div className="w-full rounded-2xl overflow-hidden border border-neutral-800 bg-[#0c0c0c] flex items-center justify-center shadow-inner relative group" style={{ aspectRatio: cropRatio }}>
                      {previewSrc ? (
                        <img src={previewSrc} alt="Optimized Projective Preview" className="w-full h-full object-contain" />
                      ) : (
                        <FiLoader className="text-yellow-500 animate-spin" size={24} />
                      )}
                    </div>
                    
                    {/* File specs comparison dashboard */}
                    <div className="grid grid-cols-3 gap-2 bg-[#0c0c0c] p-3 rounded-2xl border border-neutral-900">
                      <div className="text-center p-1">
                        <span className="text-neutral-500 text-[9px] font-bold block uppercase tracking-wider">Before Scale</span>
                        <strong className="text-neutral-300 text-xs font-black">{(stats.original / 1024).toFixed(1)} KB</strong>
                      </div>
                      <div className="text-center p-1 border-x border-neutral-850">
                        <span className="text-neutral-500 text-[9px] font-bold block uppercase tracking-wider">Optimized Size</span>
                        <strong className="text-yellow-500 text-xs font-black">{(stats.compressed / 1024).toFixed(1)} KB</strong>
                      </div>
                      <div className="text-center p-1">
                        <span className="text-neutral-500 text-[9px] font-bold block uppercase tracking-wider">File Weight Save</span>
                        <strong className="text-green-500 text-xs font-black">
                          {stats.original ? Math.round(((stats.original - stats.compressed) / stats.original) * 100) : 0}% SAVED
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Right side: visual cropper & quality compression control */}
                  <div className="space-y-5 bg-[#0d0d0d] p-5 rounded-3xl border border-neutral-900">
                    <span className="text-[10px] font-black tracking-widest text-yellow-500 uppercase block">Interactive Alignment Controls</span>
                    
                    {/* Zoom Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-neutral-300 font-bold">Graphic Zoom Scale</label>
                        <span className="text-yellow-500 font-black">{zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.20"
                        max="3.00"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    {/* Horizontal shift */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-neutral-300 font-bold">Horizontal Focal Shift (👈 Left / Right 👉)</label>
                        <span className="text-yellow-500 font-black">{xShift > 0 ? `+${Math.round(xShift * 100)}%` : `${Math.round(xShift * 100)}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-1.50"
                        max="1.50"
                        step="0.05"
                        value={xShift}
                        onChange={(e) => setXShift(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    {/* Vertical shift */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-neutral-300 font-bold">Vertical Focal Shift (☝️ Up / Down 👇)</label>
                        <span className="text-yellow-500 font-black">{yShift > 0 ? `+${Math.round(yShift * 100)}%` : `${Math.round(yShift * 100)}%`}</span>
                      </div>
                      <input
                        type="range"
                        min="-1.50"
                        max="1.50"
                        step="0.05"
                        value={yShift}
                        onChange={(e) => setYShift(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    {/* Aspect Ratio Selector */}
                    <div className="space-y-1.5">
                      <label className="text-neutral-300 text-xs font-bold block">Target Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 border border-neutral-850 rounded-xl">
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
                            className={`py-2 text-center rounded-lg text-[10px] font-black transition-all ${
                              cropRatio === item.val
                                ? 'bg-yellow-500 text-black shadow-sm'
                                : 'bg-transparent text-neutral-400 hover:text-neutral-250 hover:bg-neutral-850'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Canvas Padding Color */}
                    <div className="space-y-1.5">
                      <label className="text-neutral-300 text-xs font-bold block">Canvas Padding Color</label>
                      <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 rounded-xl px-3 py-2">
                          <input
                            type="color"
                            value={padColor}
                            onChange={(e) => setPadColor(e.target.value)}
                            className="w-6 h-6 border-0 rounded cursor-pointer p-0 bg-transparent"
                          />
                          <span className="text-xs font-mono font-bold text-neutral-400">{padColor.toUpperCase()}</span>
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
                              className="w-6 h-6 rounded-full border border-neutral-800 shadow-sm relative hover:scale-110 transition-transform"
                              style={{ backgroundColor: color.val }}
                              title={color.label}
                            >
                              {padColor === color.val && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-yellow-500">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Target width limit Selector */}
                    <div className="space-y-1.5">
                      <label className="text-neutral-300 text-xs font-bold block">Target Image Resolution</label>
                      <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-900 border border-neutral-850 rounded-xl">
                        {[
                          { label: 'HD 1600px', val: 1600 },
                          { label: 'Standard 1200px', val: 1200 },
                          { label: 'Mobile 800px', val: 800 },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setTargetWidth(item.val)}
                            className={`py-2 text-center rounded-lg text-[10px] font-black transition-all ${
                              targetWidth === item.val
                                ? 'bg-yellow-500 text-black shadow-sm'
                                : 'bg-transparent text-neutral-400 hover:text-neutral-250 hover:bg-neutral-850'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image compression Quality Slider */}
                    <div className="space-y-1.5 border-t border-neutral-850 pt-4">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-neutral-300 font-bold">JPEG Compression Quality</label>
                        <span className="text-green-555 text-green-500 font-black">{Math.round(compressQuality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="1.0"
                        step="0.05"
                        value={compressQuality}
                        onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 border-t border-neutral-850 pt-4">
                  <button
                    type="button"
                    onClick={handleOptimizedUpload}
                    disabled={uploadingImage || !compressedBlob}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <><FiLoader className="animate-spin" size={16} />Compressing & Saving...</>
                    ) : (
                      <><FiCheck size={16} />Commit & Inject Optimized Banner</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompressingFile(null)}
                    className="flex-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-400 hover:text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
                  >
                    Cancel Crop
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalCoupon, setModalCoupon] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons/admin');
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to load coupon records', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleSave = (saved) => {
    if (modalCoupon?._id) {
      setCoupons(coupons.map(c => c._id === saved._id ? saved : c));
    } else {
      setCoupons([saved, ...coupons]);
    }
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Coupon code copied!');
  };

  return (
    <AdminLayout>
      <Helmet><title>Promo Codes & Coupons Management - Admin</title></Helmet>

      {/* Hero Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Coupons & Flash Sales</h1>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">Create custom promo codes, time-limited schedules, and category targeting locks.</p>
        </div>
        <button
          onClick={() => { setModalCoupon(null); setShowModal(true); }}
          className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/25 px-5 py-3 rounded-2xl"
        >
          <FiPlus /> New Coupon
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl animate-pulse" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
          <FiPercent className="text-gray-200 mx-auto mb-4 animate-bounce" size={48} />
          <p className="text-gray-400 font-bold text-sm">No standard or scheduled coupons configured yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon, i) => {
            const hasStockLimit = coupon.usageLimit > 0;
            const claimPercentage = hasStockLimit ? Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100) : 0;
            const now = new Date();
            const start = coupon.validFrom ? new Date(coupon.validFrom) : null;
            const expiry = coupon.validUntil || coupon.expiresAt ? new Date(coupon.validUntil || coupon.expiresAt) : null;
            
            let status = 'active';
            if (!coupon.isActive) status = 'inactive';
            else if (start && now < start) status = 'scheduled';
            else if (expiry && now > expiry) status = 'expired';

            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  status === 'active' ? 'bg-green-500' : status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />

                {/* Icon & Code */}
                <div className="flex items-center gap-3 flex-1 pl-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    status === 'active' ? 'bg-green-55 text-green-600 bg-green-50 border border-green-100' : status === 'expired' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                  }`}>
                    <FiPercent size={20} className={status === 'active' ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-gray-900 text-lg tracking-widest block select-all">{coupon.code}</span>
                      <button
                        onClick={() => copyCode(coupon.code, coupon._id)}
                        className="text-gray-400 hover:text-gray-800 transition-colors"
                      >
                        {copiedId === coupon._id ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
                      </button>
                      {coupon.isFestivalPromo && (
                        <span className="bg-pink-50 border border-pink-100 text-pink-600 text-[9px] font-black uppercase px-2 py-0.5 rounded">Festival Special</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5 font-medium">{coupon.description || 'No description provided'}</p>
                  </div>
                </div>

                {/* Quota limit progress */}
                {hasStockLimit && (
                  <div className="w-full md:w-44 flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                      <span>Redeemed</span>
                      <span>{coupon.usedCount || 0} / {coupon.usageLimit} ({claimPercentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          claimPercentage >= 90 ? 'bg-red-500' : claimPercentage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${Math.min(100, claimPercentage)}%` }} 
                      />
                    </div>
                  </div>
                )}

                {/* Specs sheets badges */}
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  <div className="bg-yellow-50 border border-yellow-100 text-yellow-600 px-3 py-1.5 rounded-xl uppercase tracking-wider font-black">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </div>

                  {coupon.minOrderAmount > 0 && (
                    <div className="bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-xl font-medium">
                      Min: {formatPrice(coupon.minOrderAmount)}
                    </div>
                  )}

                  {expiry && (
                    <div className="bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-xl font-medium">
                      Expires: {formatDate(expiry)}
                    </div>
                  )}

                  <div className={`px-3 py-1.5 rounded-xl font-extrabold border uppercase tracking-widest ${
                    status === 'active' ? 'bg-green-50 border-green-100 text-green-600' :
                    status === 'expired' ? 'bg-red-50 border-red-100 text-red-600' :
                    'bg-yellow-50 border-yellow-100 text-yellow-600'
                  }`}>
                    {status}
                  </div>
                </div>

                {/* Actions buttons */}
                <div className="flex gap-2 flex-shrink-0 justify-end">
                  <button
                    onClick={() => { setModalCoupon(coupon); setShowModal(true); }}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal dialog */}
      <AnimatePresence>
        {showModal && (
          <CouponModal
            coupon={modalCoupon}
            onClose={() => { setShowModal(false); setModalCoupon(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminCoupons;

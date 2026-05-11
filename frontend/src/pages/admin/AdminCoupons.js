import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPercent, FiCopy, FiCheck } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import AdminLayout from '../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const emptyCoupon = {
  code: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscount: '', usageLimit: '',
  expiresAt: '', isActive: true, description: '',
};

const CouponModal = ({ coupon, onClose, onSave }) => {
  const [form, setForm] = useState(coupon || emptyCoupon);
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm({ ...form, code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (coupon?._id) {
        res = await api.put(`/coupons/${coupon._id}`, form);
        toast.success('Coupon updated!');
      } else {
        res = await api.post('/coupons', form);
        toast.success('Coupon created!');
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">{coupon?._id ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-xs mb-1 block">Coupon Code *</label>
            <div className="flex gap-2">
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="input-luxury flex-1 font-mono tracking-widest"
                required
                placeholder="e.g. SAVE20"
              />
              <button type="button" onClick={generateCode} className="btn-secondary text-xs px-3">Generate</button>
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-luxury"
              placeholder="e.g. 20% off on orders above ₹999"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="input-luxury"
              >
                <option value="percentage" className="bg-dark-800">Percentage (%)</option>
                <option value="fixed" className="bg-dark-800">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">
                Discount Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="input-luxury"
                required
                min="1"
                max={form.discountType === 'percentage' ? 100 : undefined}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Min Order (₹)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="input-luxury"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Max Discount (₹)</label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                className="input-luxury"
                min="0"
                placeholder="No limit"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="input-luxury"
                min="1"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Expires At</label>
              <input
                type="date"
                value={form.expiresAt ? form.expiresAt.split('T')[0] : ''}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="input-luxury"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-white/70 text-sm">Active (usable by customers)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : coupon?._id ? 'Update' : 'Create Coupon'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCoupon, setModalCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    api.get('/coupons/admin').then(({ data }) => {
      setCoupons(data.coupons || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
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
    toast.success('Code copied!');
  };

  return (
    <AdminLayout>
      <Helmet><title>Coupons - Admin</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Coupons</h1>
          <p className="text-white/40 text-sm">{coupons.length} coupons</p>
        </div>
        <button
          onClick={() => { setModalCoupon(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <FiPlus size={16} /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <FiPercent className="text-white/20 mx-auto mb-4" size={48} />
          <p className="text-white/40">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon, i) => (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Code */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <FiPercent className="text-yellow-400" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-yellow-400 text-lg tracking-widest">{coupon.code}</span>
                    <button
                      onClick={() => copyCode(coupon.code, coupon._id)}
                      className="text-white/30 hover:text-white transition-colors"
                    >
                      {copiedId === coupon._id ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                  <p className="text-white/40 text-xs">{coupon.description || 'No description'}</p>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="glass-gold rounded-lg px-3 py-1.5">
                  <span className="text-yellow-400 font-semibold">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </span>
                </div>
                {coupon.minOrderAmount > 0 && (
                  <div className="glass rounded-lg px-3 py-1.5 text-white/50">
                    Min: {formatPrice(coupon.minOrderAmount)}
                  </div>
                )}
                <div className="glass rounded-lg px-3 py-1.5 text-white/50">
                  Used: {coupon.usedCount || 0}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                </div>
                {coupon.expiresAt && (
                  <div className={`glass rounded-lg px-3 py-1.5 ${new Date(coupon.expiresAt) < new Date() ? 'text-red-400' : 'text-white/50'}`}>
                    Exp: {formatDate(coupon.expiresAt)}
                  </div>
                )}
                <div className={`rounded-lg px-3 py-1.5 font-medium ${coupon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { setModalCoupon(coupon); setShowModal(true); }}
                  className="p-2 text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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

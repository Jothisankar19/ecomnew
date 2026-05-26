import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiTarget, FiPlus, FiSave, FiTrash2, FiGift, FiRefreshCw, FiTrendingUp, FiAward
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../utils/api';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const MILESTONE_STYLES = {
  starting: { label: 'Getting started', bar: 'bg-gray-300', text: 'text-gray-600' },
  momentum: { label: 'Building momentum', bar: 'bg-blue-400', text: 'text-blue-600' },
  halfway: { label: 'Halfway there', bar: 'bg-indigo-500', text: 'text-indigo-600' },
  almost: { label: 'Almost there!', bar: 'bg-violet-500', text: 'text-violet-600' },
  achieved: { label: 'Goal achieved', bar: 'bg-emerald-500', text: 'text-emerald-600' },
};

const emptyGoalForm = () => ({
  categoryId: '',
  targetUnits: '',
  targetRevenue: '',
  surpriseTitle: 'Goal Achieved! 🎉',
  surpriseDescription: 'Unlock your surprise reward for this category.',
  inspirationQuote: 'Small steps weave big celebrations.',
  isActive: true,
});

const AdminGoals = () => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ total: 0, achieved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyGoalForm());
  const [draftGoals, setDraftGoals] = useState([]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/category-goals');
      if (data.success) {
        setGoals(data.goals || []);
        setCategories(data.categories || []);
        setSummary(data.summary || {});
        setDraftGoals(
          (data.goals || []).map((g) => ({
            categoryId: g.categoryId,
            targetUnits: g.targetUnits,
            targetRevenue: g.targetRevenue,
            surpriseTitle: g.surpriseTitle,
            surpriseDescription: g.surpriseDescription,
            inspirationQuote: g.inspirationQuote,
            isActive: g.isActive !== false,
          }))
        );
      }
    } catch {
      toast.error('Failed to load category goals');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGoals();
    const id = setInterval(loadGoals, 60000);
    return () => clearInterval(id);
  }, []);

  const usedCategoryIds = new Set(draftGoals.map((g) => g.categoryId));
  const availableCategories = categories.filter((c) => !usedCategoryIds.has(c._id));

  const handleAddGoal = () => {
    if (!form.categoryId) {
      toast.error('Select a category');
      return;
    }
    if (!Number(form.targetUnits) && !Number(form.targetRevenue)) {
      toast.error('Set at least a unit or revenue target');
      return;
    }
    setDraftGoals([
      ...draftGoals,
      {
        categoryId: form.categoryId,
        targetUnits: Number(form.targetUnits) || 0,
        targetRevenue: Number(form.targetRevenue) || 0,
        surpriseTitle: form.surpriseTitle,
        surpriseDescription: form.surpriseDescription,
        inspirationQuote: form.inspirationQuote,
        isActive: true,
      },
    ]);
    setForm(emptyGoalForm());
    setShowForm(false);
    toast.success('Goal added — save to apply');
  };

  const removeGoal = (categoryId) => {
    setDraftGoals(draftGoals.filter((g) => g.categoryId !== categoryId));
  };

  const updateDraft = (categoryId, field, value) => {
    setDraftGoals(
      draftGoals.map((g) => (g.categoryId === categoryId ? { ...g, [field]: value } : g))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings', { categoryGoals: draftGoals });
      if (res.data.success) {
        toast.success('Category goals saved');
        await loadGoals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goals');
    }
    setSaving(false);
  };

  const liveByCategory = Object.fromEntries(goals.map((g) => [g.categoryId, g]));

  return (
    <AdminLayout>
      <Helmet><title>Sales Goals — Kurti Elegance Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiTarget className="text-yellow-600" />
            Category Sales Goals
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Monthly targets per category — progress updates from paid orders
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadGoals}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-yellow-400 flex items-center gap-2"
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            disabled={availableCategories.length === 0}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <FiPlus size={14} />
            Add goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active goals', value: summary.total, icon: FiTarget, bg: 'bg-violet-50', color: 'text-violet-600' },
          { label: 'In progress', value: summary.inProgress, icon: FiTrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Achieved', value: summary.achieved, icon: FiAward, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <s.icon className={s.color} size={18} />
            <p className="text-xs text-gray-500 mt-2">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-2xl border border-yellow-200 p-5 mb-6 shadow-sm"
        >
          <h3 className="font-bold text-gray-800 mb-4">New category goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              >
                <option value="">Select category</option>
                {availableCategories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Target units (month)</label>
                <input
                  type="number"
                  min="0"
                  value={form.targetUnits}
                  onChange={(e) => setForm({ ...form, targetUnits: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Target revenue (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.targetRevenue}
                  onChange={(e) => setForm({ ...form, targetRevenue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">Surprise title (when achieved)</label>
              <input
                type="text"
                value={form.surpriseTitle}
                onChange={(e) => setForm({ ...form, surpriseTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">Surprise description</label>
              <textarea
                rows={2}
                value={form.surpriseDescription}
                onChange={(e) => setForm({ ...form, surpriseDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">Inspiration quote</label>
              <input
                type="text"
                value={form.inspirationQuote}
                onChange={(e) => setForm({ ...form, inspirationQuote: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleAddGoal}
              className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-semibold"
            >
              Add to list
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : draftGoals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FiTarget size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No category goals yet. Add one to track monthly sales.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draftGoals.map((dg) => {
            const live = liveByCategory[dg.categoryId];
            const catName = live?.categoryName || categories.find((c) => c._id === dg.categoryId)?.name || 'Category';
            const ms = MILESTONE_STYLES[live?.milestone || 'starting'];
            const pct = live?.progressPct ?? 0;

            return (
              <motion.div
                key={dg.categoryId}
                layout
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  live?.achieved ? 'border-emerald-200' : 'border-gray-100'
                }`}
              >
                <div className="px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{catName}</h3>
                    <p className={`text-xs font-semibold ${ms.text}`}>{ms.label} · {pct}% overall</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGoal(dg.categoryId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Remove goal"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="px-5 py-3">
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full ${ms.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  {live && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">Units</p>
                        <p className="font-semibold">{live.currentUnits} / {dg.targetUnits || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Revenue</p>
                        <p className="font-semibold">{formatINR(live.currentRevenue)} / {dg.targetRevenue ? formatINR(dg.targetRevenue) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Units %</p>
                        <p className="font-semibold">{live.unitsPct}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Revenue %</p>
                        <p className="font-semibold">{live.revenuePct}%</p>
                      </div>
                    </div>
                  )}

                  {live?.surpriseUnlocked && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-emerald-50 border border-yellow-100 mb-4">
                      <FiGift className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-bold text-gray-800">{dg.surpriseTitle}</p>
                        <p className="text-sm text-gray-600 mt-1">{dg.surpriseDescription}</p>
                        <p className="text-xs text-gray-400 italic mt-2">"{dg.inspirationQuote}"</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Target units</label>
                      <input
                        type="number"
                        min="0"
                        value={dg.targetUnits}
                        onChange={(e) => updateDraft(dg.categoryId, 'targetUnits', Number(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Target revenue (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={dg.targetRevenue}
                        onChange={(e) => updateDraft(dg.categoryId, 'targetRevenue', Number(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500">Surprise title</label>
                      <input
                        type="text"
                        value={dg.surpriseTitle}
                        onChange={(e) => updateDraft(dg.categoryId, 'surpriseTitle', e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {draftGoals.length > 0 && (
        <div className="mt-6 sticky bottom-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-bold shadow-lg shadow-yellow-200/50 disabled:opacity-70"
          >
            <FiSave size={18} />
            {saving ? 'Saving…' : 'Save all category goals'}
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminGoals;

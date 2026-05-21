import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

/* ── Filter data ─────────────────────────────────────────────── */
export const COLORS = [
  { name: 'Blue', hex: '#3b82f6' }, { name: 'Green', hex: '#22c55e' },
  { name: 'Pink', hex: '#ec4899' }, { name: 'Black', hex: '#1f2937' },
  { name: 'Red', hex: '#ef4444' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'White', hex: '#f9fafb' }, { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Maroon', hex: '#7f1d1d' },
  { name: 'Teal', hex: '#14b8a6' }, { name: 'Beige', hex: '#d4b896' },
];

export const FABRICS = ['Cotton', 'Silk', 'Rayon', 'Georgette', 'Chiffon', 'Linen', 'Polyester', 'Viscose'];
export const FIT_SILHOUETTE = ['Relaxed Fit', 'Slim Fit', 'Regular Fit', 'Oversized', 'Bodycon'];
export const PATTERNS = ['Floral', 'Geometric', 'Abstract', 'Solid', 'Stripes', 'Checks', 'Animal Print', 'Paisley'];
export const SLEEVE_LENGTHS = ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Cap Sleeve'];
export const NECK_TYPES = ['Round Neck', 'V-Neck', 'Boat Neck', 'Collar Neck', 'Mandarin Collar', 'Sweetheart'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

/* ── Collapsible filter section ─────────────────────────────── */
export const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        {open ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Checkbox item ───────────────────────────────────────────── */
export const CheckItem = ({ label, count, checked, onChange }) => (
  <label className="flex items-center justify-between gap-2 py-1 cursor-pointer group">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 accent-yellow-500 rounded"
      />
      <span className={`text-sm transition-colors ${checked ? 'text-yellow-600 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-xs text-gray-400">({count})</span>
    )}
  </label>
);

/* ── Sidebar ─────────────────────────────────────────────────── */
const FilterSidebar = ({ localFilters, setLocalFilters, onApply, onClear, categories, lockedCategoryId, lockedCategoryName }) => {
  const toggle = (key, value) => {
    setLocalFilters(prev => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const isChecked = (key, value) => (localFilters[key] || []).includes(value);

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <FiFilter size={16} className="text-yellow-500" /> Filters
          </h3>
          <button
            onClick={onClear}
            className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            Clear All
          </button>
        </div>

        <FilterSection title="Colour">
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => toggle('colors', c.name)}
                title={c.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${isChecked('colors', c.name) ? 'border-yellow-500 scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          {(localFilters.colors || []).length > 0 && (
            <p className="text-xs text-yellow-600 mt-2">{(localFilters.colors).join(', ')}</p>
          )}
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category">
          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {lockedCategoryId ? (
              <div className="py-2 px-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800">{lockedCategoryName || 'Selected Category'}</span>
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">Locked</span>
              </div>
            ) : (
              (categories?.length > 0 ? categories : []).map(cat => (
                <CheckItem
                  key={cat._id || cat.name}
                  label={cat.name}
                  checked={isChecked('categoryNames', cat.name)}
                  onChange={() => toggle('categoryNames', cat.name)}
                />
              ))
            )}
          </div>
        </FilterSection>

        {/* Fabric */}
        <FilterSection title="Fabric">
          <div className="space-y-0.5">
            {FABRICS.map(f => (
              <CheckItem key={f} label={f} checked={isChecked('fabrics', f)} onChange={() => toggle('fabrics', f)} />
            ))}
          </div>
        </FilterSection>

        {/* Fit / Silhouette */}
        <FilterSection title="Fit / Silhouette">
          <div className="space-y-0.5">
            {FIT_SILHOUETTE.map(f => (
              <CheckItem key={f} label={f} checked={isChecked('fits', f)} onChange={() => toggle('fits', f)} />
            ))}
          </div>
        </FilterSection>

        {/* Pattern & Print */}
        <FilterSection title="Pattern & Print">
          <div className="space-y-0.5">
            {PATTERNS.map(p => (
              <CheckItem key={p} label={p} checked={isChecked('patterns', p)} onChange={() => toggle('patterns', p)} />
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={localFilters.minPrice || ''}
                onChange={e => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={localFilters.maxPrice || ''}
                onChange={e => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[['Under ₹500', '', '500'], ['₹500–₹1000', '500', '1000'], ['₹1000–₹2000', '1000', '2000'], ['₹2000+', '2000', '']].map(([label, min, max]) => (
                <button
                  key={label}
                  onClick={() => setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${localFilters.minPrice === min && localFilters.maxPrice === max
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Size */}
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {SIZES.map(s => (
              <button
                key={s}
                onClick={() => toggle('sizes', s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isChecked('sizes', s)
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Sleeve Length */}
        <FilterSection title="Sleeve Length" defaultOpen={false}>
          <div className="space-y-0.5">
            {SLEEVE_LENGTHS.map(s => (
              <CheckItem key={s} label={s} checked={isChecked('sleeves', s)} onChange={() => toggle('sleeves', s)} />
            ))}
          </div>
        </FilterSection>

        {/* Neck Type */}
        <FilterSection title="Neck" defaultOpen={false}>
          <div className="space-y-0.5">
            {NECK_TYPES.map(n => (
              <CheckItem key={n} label={n} checked={isChecked('necks', n)} onChange={() => toggle('necks', n)} />
            ))}
          </div>
        </FilterSection>

        {/* Apply Button */}
        <button
          onClick={onApply}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-white font-bold text-sm py-3 rounded-xl transition-colors mt-2"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;

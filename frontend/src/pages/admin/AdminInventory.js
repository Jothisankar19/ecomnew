import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiAlertTriangle, FiPackage, FiTrendingDown, FiSearch,
  FiEdit2, FiCheck, FiX, FiRefreshCw
} from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import AdminLayout from '../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const InventoryFieldEditor = ({ product, field, onSave, onCancel }) => {
  const initial = field === 'price' ? product.price : product.stock;
  const [value, setValue] = useState(initial);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      return toast.error(field === 'price' ? 'Enter a valid price' : 'Enter a valid stock quantity');
    }
    setLoading(true);
    try {
      const payload = field === 'price' ? { price: num } : { stock: num };
      await api.put(`/products/${product._id}`, payload);
      onSave(product._id, payload);
      toast.success(field === 'price' ? 'Price updated!' : 'Stock updated!');
    } catch {
      toast.error(field === 'price' ? 'Failed to update price' : 'Failed to update stock');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 bg-white border border-yellow-300 rounded-lg px-2.5 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
        placeholder={field === 'price' ? 'Price ₹' : 'Qty'}
        min="0"
        autoFocus
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        title={field === 'price' ? 'Save price' : 'Save stock'}
        className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
      >
        <FiCheck size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        title="Cancel"
        className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all"
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceEditId, setPriceEditId] = useState(null);
  const [stockEditId, setStockEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/inventory?lowStock=${lowStockThreshold}`);
      setProducts(data.products || []);
      setLowStockProducts(data.lowStockProducts || []);
      setOutOfStock(data.outOfStock || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, [lowStockThreshold]);

  const handleInventoryUpdate = (productId, updates) => {
    const update = (list) => list.map(p => p._id === productId ? { ...p, ...updates } : p);
    setProducts(update(products));
    setLowStockProducts(update(lowStockProducts));
    setOutOfStock(update(outOfStock));
    setPriceEditId(null);
    setStockEditId(null);
  };

  const startPriceEdit = (productId) => {
    setStockEditId(null);
    setPriceEditId(productId);
  };

  const startStockEdit = (productId) => {
    setPriceEditId(null);
    setStockEditId(productId);
  };

  const displayProducts = activeTab === 'all'
    ? products
    : activeTab === 'low'
    ? lowStockProducts
    : outOfStock;

  const filtered = displayProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Helmet><title>Inventory - Admin</title></Helmet>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-400 text-sm">Update price and stock separately for each product</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <FiPackage className="text-blue-500" size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Products</p>
            <p className="text-gray-800 font-bold text-2xl">{products.length}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
            <FiAlertTriangle className="text-yellow-500" size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Low Stock</p>
            <p className="text-yellow-600 font-bold text-2xl">{lowStockProducts.length}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <FiTrendingDown className="text-red-500" size={22} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Out of Stock</p>
            <p className="text-red-500 font-bold text-2xl">{outOfStock.length}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm whitespace-nowrap">Low stock:</span>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-16 bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-yellow-400 text-center"
            min="1"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchInventory} className="flex items-center gap-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-medium text-sm px-4 py-2 rounded-xl transition-colors">
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: `All (${products.length})` },
          { id: 'low', label: `Low Stock (${lowStockProducts.length})` },
          { id: 'out', label: `Out of Stock (${outOfStock.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === id ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">PRODUCT</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">CATEGORY</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">PRICE</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">SOLD</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">STOCK</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No products found</td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/40x50'}
                          alt={product.name}
                          className="w-10 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <p className="text-gray-800 text-sm font-medium line-clamp-2 max-w-[160px]">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-500 text-sm">{product.category?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {priceEditId === product._id ? (
                        <InventoryFieldEditor
                          product={product}
                          field="price"
                          onSave={handleInventoryUpdate}
                          onCancel={() => setPriceEditId(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 text-sm font-bold">{formatPrice(product.price)}</span>
                          <button
                            type="button"
                            onClick={() => startPriceEdit(product._id)}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                            title="Change price"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-500 text-sm">{product.sold || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      {stockEditId === product._id ? (
                        <InventoryFieldEditor
                          product={product}
                          field="stock"
                          onSave={handleInventoryUpdate}
                          onCancel={() => setStockEditId(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${
                            product.stock === 0 ? 'text-red-400' :
                            product.stock <= lowStockThreshold ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => startStockEdit(product._id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Change stock"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        product.stock === 0 ? 'bg-red-100 text-red-600' :
                        product.stock <= lowStockThreshold ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' :
                         product.stock <= lowStockThreshold ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;

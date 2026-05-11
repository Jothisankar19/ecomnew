import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiAlertTriangle, FiPackage, FiTrendingDown, FiSearch,
  FiEdit2, FiCheck, FiX
} from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import AdminLayout from '../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const StockEditor = ({ product, onSave, onCancel }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/products/${product._id}`, { stock: Number(stock) });
      onSave(product._id, Number(stock));
      toast.success('Stock updated!');
    } catch (err) {
      toast.error('Failed to update stock');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-yellow-500/50"
        min="0"
        autoFocus
      />
      <button onClick={handleSave} disabled={loading} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all">
        <FiCheck size={14} />
      </button>
      <button onClick={onCancel} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
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
  const [editingId, setEditingId] = useState(null);
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

  const handleStockUpdate = (productId, newStock) => {
    const update = (list) => list.map(p => p._id === productId ? { ...p, stock: newStock } : p);
    setProducts(update(products));
    setLowStockProducts(update(lowStockProducts));
    setOutOfStock(update(outOfStock));
    setEditingId(null);
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
        <h1 className="font-display text-2xl font-bold text-white">Inventory Management</h1>
        <p className="text-white/40 text-sm">Monitor and update product stock levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <FiPackage className="text-blue-400" size={22} />
          </div>
          <div>
            <p className="text-white/40 text-sm">Total Products</p>
            <p className="text-white font-bold text-2xl">{products.length}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <FiAlertTriangle className="text-yellow-400" size={22} />
          </div>
          <div>
            <p className="text-white/40 text-sm">Low Stock</p>
            <p className="text-yellow-400 font-bold text-2xl">{lowStockProducts.length}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <FiTrendingDown className="text-red-400" size={22} />
          </div>
          <div>
            <p className="text-white/40 text-sm">Out of Stock</p>
            <p className="text-red-400 font-bold text-2xl">{outOfStock.length}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury pl-10 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm whitespace-nowrap">Low stock threshold:</span>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-16 input-luxury text-sm py-2 text-center"
            min="1"
          />
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
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id ? 'bg-yellow-500 text-black' : 'glass text-white/50 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium">PRODUCT</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium hidden md:table-cell">CATEGORY</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium">PRICE</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium">SOLD</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium">STOCK</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium">STATUS</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-medium">EDIT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 skeleton rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30">No products found</td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/40x50'}
                          alt={product.name}
                          className="w-10 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <p className="text-white text-sm font-medium line-clamp-2 max-w-[160px]">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-white/50 text-sm">{product.category?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-yellow-400 text-sm font-semibold">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white/50 text-sm">{product.sold || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === product._id ? (
                        <StockEditor
                          product={product}
                          onSave={handleStockUpdate}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <span className={`font-bold text-sm ${
                          product.stock === 0 ? 'text-red-400' :
                          product.stock <= lowStockThreshold ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        product.stock === 0 ? 'bg-red-500/20 text-red-400' :
                        product.stock <= lowStockThreshold ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' :
                         product.stock <= lowStockThreshold ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId !== product._id && (
                        <button
                          onClick={() => setEditingId(product._id)}
                          className="p-2 text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                        >
                          <FiEdit2 size={15} />
                        </button>
                      )}
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

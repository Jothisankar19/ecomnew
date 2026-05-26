const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, totalRevenue, totalUsers, totalProducts,
      monthOrders, monthRevenue, lastMonthRevenue,
      pendingOrders, recentOrders, topProducts, ordersByStatus
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { 'payment.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.countDocuments({ orderStatus: 'processing' }),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).populate('category', 'name'),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }])
    ]);

    const currentRevenue = monthRevenue[0]?.total || 0;
    const prevRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        totalProducts,
        monthOrders,
        monthRevenue: currentRevenue,
        revenueGrowth,
        pendingOrders
      },
      recentOrders,
      topProducts,
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revenue analytics
// @route   GET /api/admin/analytics/revenue
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    let startDate, groupBy;

    switch (period) {
      case '7days':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case '30days':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case '12months':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const revenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, 'payment.status': 'paid' } },
      { $group: { _id: groupBy, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const categoryRevenue = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $group: { _id: '$category.name', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 6 }
    ]);

    res.json({ success: true, revenueData, categoryRevenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));

    // Calculate overall user stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.json({
      success: true,
      total,
      users,
      summary: {
        totalUsers,
        activeUsers,
        inactiveUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Check if user is admin
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrators cannot be deleted' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User permanently removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get inventory report
// @route   GET /api/admin/inventory
exports.getInventory = async (req, res) => {
  try {
    const { lowStock = 10 } = req.query;
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ stock: 1 })
      .select('name images price stock sold category isFeatured');

    const lowStockProducts = products.filter(p => p.stock <= Number(lowStock));
    const outOfStock = products.filter(p => p.stock === 0);

    res.json({ success: true, products, lowStockProducts, outOfStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending orders for banner
// @route   GET /api/admin/trending-orders
exports.getTrendingOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find({ orderStatus: { $in: ['confirmed', 'packed', 'shipped', 'delivered'] } })
      .populate('user', 'name')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const banners = recentOrders.map(order => ({
      userName: order.user?.name || 'Someone',
      productName: order.items[0]?.name || 'a product',
      productImage: order.items[0]?.product?.images?.[0]?.url,
      city: order.shippingAddress?.city || 'India',
      state: order.shippingAddress?.state,
      action: ['purchased', 'ordered', 'just bought'][Math.floor(Math.random() * 3)],
      time: order.createdAt
    }));

    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific user analytics
// @route   GET /api/admin/users/:id/analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const orders = await Order.find({ user: req.params.id })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((acc, order) => {
      if (order.payment && order.payment.status === 'paid') {
        return acc + order.pricing.total;
      }
      return acc;
    }, 0);
    
    const averageOrderValue = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0;

    res.json({
      success: true,
      user,
      analytics: {
        totalOrders,
        totalSpent,
        averageOrderValue
      },
      recentOrders: orders.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Live daily insights for admin dashboard (poll every 30s)
// @route   GET /api/admin/live-insights
exports.getLiveInsights = async (req, res) => {
  try {
    const today = startOfToday();
    const lowStockThreshold = Number(req.query.lowStock) || 10;

    const [
      todayOrders,
      todayCancelled,
      todayRevenueAgg,
      todayCouponOrders,
      lowStockCount,
      outOfStockCount,
      activeCoupons,
      recentOrders,
      todayNewUsers
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: today }, orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: today }, 'coupon.code': { $exists: true, $ne: '' } }),
      Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: lowStockThreshold } }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      Coupon.find({ isActive: true }).select('code usedCount usageLimit showBanner isFestivalPromo discountValue discountType validUntil').sort({ usedCount: -1 }).limit(12),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(8).select('orderId orderStatus pricing.total createdAt user coupon'),
      User.countDocuments({ role: 'customer', createdAt: { $gte: today } })
    ]);

    const couponActivity = await Promise.all(
      activeCoupons.map(async (c) => {
        const todayUses = await Order.countDocuments({
          createdAt: { $gte: today },
          'coupon.code': c.code
        });
        return {
          _id: c._id,
          code: c.code,
          usedCount: c.usedCount,
          usageLimit: c.usageLimit,
          todayUses,
          isFlash: c.isFestivalPromo || c.showBanner,
          discountLabel: c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`,
          nearlyFull: c.usageLimit ? c.usedCount >= c.usageLimit * 0.9 : false
        };
      })
    );

    const flashGrabbers = couponActivity.filter((c) => c.isFlash).reduce((s, c) => s + c.todayUses, 0);

    res.json({
      success: true,
      timestamp: new Date(),
      daily: {
        orders: todayOrders,
        cancelled: todayCancelled,
        revenue: todayRevenueAgg[0]?.total || 0,
        paidOrders: todayRevenueAgg[0]?.count || 0,
        couponOrders: todayCouponOrders,
        newCustomers: todayNewUsers
      },
      inventory: { lowStock: lowStockCount, outOfStock: outOfStockCount, threshold: lowStockThreshold },
      coupons: couponActivity,
      flashSale: {
        activeDeals: couponActivity.filter((c) => c.isFlash).length,
        grabsToday: flashGrabbers
      },
      recentOrders: recentOrders.map((o) => ({
        _id: o._id,
        orderId: o.orderId,
        status: o.orderStatus,
        total: o.pricing?.total,
        customer: o.user?.name,
        coupon: o.coupon?.code,
        createdAt: o.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Category sales goals with live progress
// @route   GET /api/admin/category-goals
exports.getCategoryGoals = async (req, res) => {
  try {
    const settings = await Settings.findOne().populate('categoryGoals.categoryId', 'name slug');
    const goals = (settings?.categoryGoals || []).filter((g) => g.isActive !== false && g.categoryId);

    const monthStart = startOfMonth();
    const categoryIds = goals.map((g) => g.categoryId._id || g.categoryId);

    const salesByCategory = await Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, 'payment.status': 'paid' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { 'product.category': { $in: categoryIds } } },
      {
        $group: {
          _id: '$product.category',
          units: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]);

    const salesMap = Object.fromEntries(
      salesByCategory.map((s) => [s._id.toString(), { units: s.units, revenue: s.revenue }])
    );

    const enriched = goals.map((g) => {
      const catId = (g.categoryId._id || g.categoryId).toString();
      const current = salesMap[catId] || { units: 0, revenue: 0 };
      const targetUnits = g.targetUnits || 0;
      const targetRevenue = g.targetRevenue || 0;
      const unitsPct = targetUnits > 0 ? Math.min(100, Math.round((current.units / targetUnits) * 100)) : 0;
      const revenuePct = targetRevenue > 0 ? Math.min(100, Math.round((current.revenue / targetRevenue) * 100)) : 0;
      const progressPct = Math.round((unitsPct + revenuePct) / 2) || 0;
      const achieved = (targetUnits > 0 && current.units >= targetUnits) ||
        (targetRevenue > 0 && current.revenue >= targetRevenue) ||
        (targetUnits > 0 && targetRevenue > 0 && current.units >= targetUnits && current.revenue >= targetRevenue);

      let milestone = 'starting';
      if (progressPct >= 100 || achieved) milestone = 'achieved';
      else if (progressPct >= 75) milestone = 'almost';
      else if (progressPct >= 50) milestone = 'halfway';
      else if (progressPct >= 25) milestone = 'momentum';

      return {
        _id: g._id,
        categoryId: catId,
        categoryName: g.categoryId.name || 'Category',
        targetUnits,
        targetRevenue,
        currentUnits: current.units,
        currentRevenue: current.revenue,
        unitsPct,
        revenuePct,
        progressPct,
        achieved,
        surpriseUnlocked: achieved,
        milestone,
        surpriseTitle: g.surpriseTitle,
        surpriseDescription: g.surpriseDescription,
        inspirationQuote: g.inspirationQuote,
        isActive: g.isActive !== false
      };
    });

    const categories = await Category.find({ isActive: true }).select('name slug');

    res.json({
      success: true,
      goals: enriched,
      categories,
      summary: {
        total: enriched.length,
        achieved: enriched.filter((g) => g.achieved).length,
        inProgress: enriched.filter((g) => !g.achieved && g.progressPct > 0).length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');

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
    res.json({ success: true, total, users });
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

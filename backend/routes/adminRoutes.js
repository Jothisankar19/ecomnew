const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats, getRevenueAnalytics, getAllUsers,
  toggleUserStatus, deleteUser, getInventory, getTrendingOrders
} = require('../controllers/adminController');

// Public route — no auth needed (used by TrendingBanner on homepage)
router.get('/trending-orders', getTrendingOrders);

// All routes below require admin auth
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/inventory', getInventory);

module.exports = router;

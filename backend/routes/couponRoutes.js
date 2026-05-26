const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const cache = require('../utils/cache');

// Admin: get all coupons
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public: Get currently active promotions
router.get('/active', async (req, res) => {
  try {
    const cached = await cache.get('active_coupons');
    if (cached) {
      return res.json({ success: true, coupons: cached });
    }
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { showBanner: true },
        {
          $and: [
            {
              $or: [
                { validFrom: null },
                { validFrom: { $lte: now } }
              ]
            },
            {
              $or: [
                { validUntil: null },
                { validUntil: { $gte: now } },
                { expiresAt: { $gte: now } }
              ]
            }
          ]
        }
      ]
    }).populate('applicableCategories').populate('applicableProducts');
    await cache.set('active_coupons', coupons, 300); // 5 minutes cache
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    await cache.del('active_coupons');
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await cache.del('active_coupons');
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    await cache.del('active_coupons');
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    const validity = coupon.isValid(orderAmount, req.user._id);
    if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });
    const discount = coupon.calculateDiscount(orderAmount);
    res.json({ success: true, discount, coupon: { code: coupon.code, description: coupon.description } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

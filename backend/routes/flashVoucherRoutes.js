const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const FlashVoucher = require('../models/FlashVoucher');
const Product = require('../models/Product');
const cache = require('../utils/cache');
const crypto = require('crypto');

// Utility to auto-generate unique coupon codes
const generateCouponCode = (prefix = 'FLASH', length = 5) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randBytes[i] % chars.length];
  }
  return `${prefix.toUpperCase()}${result}`;
};

// @desc    Create flash sale voucher (Admin)
// @route   POST /api/flash-sales
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { 
      code, 
      autoGenerate,
      prefix,
      description, 
      discountType, 
      discountValue, 
      minCartValue, 
      maxDiscountLimit, 
      startTime, 
      endTime, 
      totalStock,
      applicableProducts,
      applicableCategories,
      isFestivalPromo
    } = req.body;

    let voucherCode = code ? code.toUpperCase() : '';
    if (autoGenerate) {
      let isUnique = false;
      while (!isUnique) {
        voucherCode = generateCouponCode(prefix || 'FLASH');
        const existing = await FlashVoucher.findOne({ code: voucherCode });
        if (!existing) isUnique = true;
      }
    }

    if (!voucherCode) {
      return res.status(400).json({ success: false, message: 'Voucher code or auto-generation is required.' });
    }

    const existing = await FlashVoucher.findOne({ code: voucherCode });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Voucher code already exists.' });
    }

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    let initialStatus = 'scheduled';
    
    if (now >= start && now <= end) {
      initialStatus = 'active';
    } else if (now > end) {
      initialStatus = 'expired';
    }

    const voucher = await FlashVoucher.create({
      code: voucherCode,
      description,
      discountType,
      discountValue,
      minCartValue: minCartValue || 0,
      maxDiscountLimit,
      startTime: start,
      endTime: end,
      totalStock,
      status: initialStatus,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      isFestivalPromo: isFestivalPromo || false
    });

    await cache.del('active_flash_vouchers');
    res.status(201).json({ success: true, voucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get product-level sale offers from all active campaigns
// @route   GET /api/flash-sales/product-offers
router.get('/product-offers', async (req, res) => {
  try {
    const cached = await cache.get('product_sale_offers');
    if (cached) {
      return res.status(200).json({ success: true, offers: cached });
    }

    const now = new Date();
    const Coupon = require('../models/Coupon');

    // Fetch all active flash vouchers
    const flashVouchers = await FlashVoucher.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).populate('applicableProducts', '_id price discountPrice')
      .populate('applicableCategories', '_id');

    // Fetch all active coupons
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { validUntil: null },
        { validUntil: { $gte: now } },
        { expiresAt: { $gte: now } }
      ]
    }).populate('applicableProducts', '_id price discountPrice')
      .populate('applicableCategories', '_id');

    // Build product -> best offer map
    const offerMap = {};

    const processCampaign = (campaign, type) => {
      const { discountType, discountValue, code, description } = campaign;
      const endTime = campaign.endTime || campaign.validUntil || campaign.expiresAt;
      const products = campaign.applicableProducts || [];
      const categories = campaign.applicableCategories || [];

      // Only map product-specific campaigns (not store-wide ones)
      if (products.length === 0 && categories.length === 0) return;

      products.forEach(product => {
        if (!product || !product._id) return;
        const pid = product._id.toString();
        const basePrice = product.discountPrice || product.price || 0;

        let offerDiscount = 0;
        if (discountType === 'percentage') {
          offerDiscount = Math.round(discountValue);
        } else if (basePrice > 0) {
          offerDiscount = Math.round((discountValue / basePrice) * 100);
        }

        let offerPrice = basePrice;
        if (discountType === 'percentage') {
          offerPrice = Math.round(basePrice - (basePrice * discountValue / 100));
        } else {
          offerPrice = Math.round(basePrice - discountValue);
        }
        offerPrice = Math.max(0, offerPrice);

        // Keep the best (highest) discount for each product
        if (!offerMap[pid] || offerDiscount > offerMap[pid].discountPercent) {
          offerMap[pid] = {
            discountPercent: offerDiscount,
            offerPrice,
            originalPrice: basePrice,
            code,
            campaignType: type,
            description: description || '',
            endTime
          };
        }
      });
    };

    flashVouchers.forEach(v => processCampaign(v, 'flash'));
    coupons.forEach(c => processCampaign(c, 'coupon'));

    await cache.set('product_sale_offers', offerMap, 120); // cache 2 minutes
    res.status(200).json({ success: true, offers: offerMap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get all active flash sale campaigns
// @route   GET /api/flash-sales/active
router.get('/active', async (req, res) => {
  try {
    // Attempt cache read
    const cached = await cache.get('active_flash_vouchers');
    if (cached) {
      return res.status(200).json({ success: true, vouchers: cached });
    }

    const now = new Date();
    // Query active and also update statuses if needed
    const vouchers = await FlashVoucher.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now }
    })
    .populate('applicableProducts')
    .populate('applicableCategories');

    await cache.set('active_flash_vouchers', vouchers, 60); // cache for 1 minute
    res.status(200).json({ success: true, vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Validate specific flash sale voucher or fallback to standard coupon
// @route   POST /api/flash-sales/validate
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, cartAmount, cartItems } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Voucher code is required.' });
    }

    let isFlash = true;
    let targetVoucher = await FlashVoucher.findOne({ code: code.toUpperCase() });
    const Coupon = require('../models/Coupon');

    if (!targetVoucher) {
      targetVoucher = await Coupon.findOne({ code: code.toUpperCase() });
      isFlash = false;
    }

    if (!targetVoucher) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    let discount = 0;
    if (isFlash) {
      const check = targetVoucher.isValid(req.user._id, cartAmount);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.message });
      }
      discount = targetVoucher.calculateDiscount(cartItems || [], cartAmount);
    } else {
      const check = targetVoucher.isValid(cartAmount, req.user._id);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.message });
      }
      discount = targetVoucher.calculateDiscount(cartItems || [], cartAmount);
    }

    if (discount === 0) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not applicable for this product category'
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Coupon applied successfully',
      voucher: {
        code: targetVoucher.code,
        description: targetVoucher.description || '',
        discountType: targetVoucher.discountType,
        discountValue: targetVoucher.discountValue,
        minCartValue: targetVoucher.minCartValue || targetVoucher.minOrderAmount || 0,
        maxDiscountLimit: targetVoucher.maxDiscountLimit || targetVoucher.maxDiscount || null
      },
      discount 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get best eligible voucher recommendations
// @route   POST /api/flash-sales/best
router.post('/best', protect, async (req, res) => {
  try {
    const { cartAmount, cartItems } = req.body;
    const now = new Date();

    const Coupon = require('../models/Coupon');
    const activeCoupons = await Coupon.find({
      isActive: true,
      $or: [
        { validUntil: null },
        { validUntil: { $gte: now } },
        { expiresAt: { $gte: now } }
      ]
    });

    const activeFlashVouchers = await FlashVoucher.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    const recommendations = [];

    // Evaluate Coupons
    for (const coupon of activeCoupons) {
      const check = coupon.isValid(cartAmount, req.user._id);
      if (check.valid) {
        const discount = coupon.calculateDiscount(cartItems || [], cartAmount);
        if (discount > 0) {
          recommendations.push({
            code: coupon.code,
            description: coupon.description || '',
            discountValue: coupon.discountValue,
            discountType: coupon.discountType,
            estimatedSavings: discount,
            isFestivalPromo: coupon.isFestivalPromo || false
          });
        }
      }
    }

    // Evaluate Flash Vouchers
    for (const voucher of activeFlashVouchers) {
      const check = voucher.isValid(req.user._id, cartAmount);
      if (check.valid) {
        const discount = voucher.calculateDiscount(cartItems || [], cartAmount);
        if (discount > 0) {
          recommendations.push({
            code: voucher.code,
            description: voucher.description,
            discountValue: voucher.discountValue,
            discountType: voucher.discountType,
            estimatedSavings: discount,
            isFestivalPromo: voucher.isFestivalPromo
          });
        }
      }
    }

    // Sort by largest discount first
    recommendations.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

    res.status(200).json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get admin analytics and list (Admin)
// @route   GET /api/flash-sales
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const vouchers = await FlashVoucher.find()
      .populate('applicableProducts')
      .populate('applicableCategories')
      .sort({ createdAt: -1 });
      
    // Generate analytics summary
    const totalVouchers = vouchers.length;
    const activeCount = vouchers.filter(v => v.status === 'active').length;
    const claimedTotal = vouchers.reduce((sum, v) => sum + v.stockClaimed, 0);

    res.status(200).json({ 
      success: true, 
      vouchers,
      analytics: {
        totalVouchers,
        activeCount,
        claimedTotal
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Enable/Disable campaign manually (Admin)
// @route   PUT /api/flash-sales/:id/toggle
router.put('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const voucher = await FlashVoucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (voucher.status === 'active') {
      voucher.status = 'expired';
    } else {
      voucher.status = 'active';
    }

    await voucher.save();
    await cache.del('active_flash_vouchers');
    res.status(200).json({ success: true, voucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

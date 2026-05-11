const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Review = require('../models/Review');
const Order = require('../models/Order');

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    let sortObj = {};
    if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'highest') sortObj = { rating: -1 };
    else if (sort === 'lowest') sortObj = { rating: 1 };
    else if (sort === 'helpful') sortObj = { helpful: -1 };

    const total = await Review.countDocuments({ product: req.params.productId, isApproved: true });
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const ratingStats = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, total, reviews, ratingStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create review
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    // Check if user purchased the product
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered'
    });
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!order
    });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark helpful
router.put('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const index = review.helpful.indexOf(req.user._id);
    if (index > -1) review.helpful.splice(index, 1);
    else review.helpful.push(req.user._id);
    await review.save();
    res.json({ success: true, helpfulCount: review.helpful.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete review
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Get wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice ratings slug');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle wishlist
router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const index = user.wishlist.indexOf(productId);
    let message;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      message = 'Removed from wishlist';
    } else {
      user.wishlist.push(productId);
      message = 'Added to wishlist';
    }
    await user.save();
    res.json({ success: true, message, isWishlisted: index === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

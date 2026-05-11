const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart, addToCart, updateCartItem, removeFromCart,
  saveForLater, applyCoupon, removeCoupon, clearCart
} = require('../controllers/cartController');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update/:itemId', protect, updateCartItem);
router.delete('/remove/:itemId', protect, removeFromCart);
router.put('/save-later/:itemId', protect, saveForLater);
router.post('/apply-coupon', protect, applyCoupon);
router.delete('/remove-coupon', protect, removeCoupon);
router.delete('/clear', protect, clearCart);

module.exports = router;

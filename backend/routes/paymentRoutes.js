const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRazorpayOrder, verifyPayment, paymentFailure,
  getPaymentDetails, razorpayWebhook
} = require('../controllers/paymentController');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/failure', protect, paymentFailure);
router.get('/:orderId', protect, getPaymentDetails);
router.post('/webhook', razorpayWebhook);

module.exports = router;

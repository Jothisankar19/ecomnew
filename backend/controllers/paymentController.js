const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { triggerOrderConfirmationEmail } = require('../utils/orderNotifications');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.pricing.total * 100), // in paise
      currency: 'INR',
      receipt: order.orderId,
      notes: { orderId: order._id.toString(), userId: req.user._id.toString() }
    });

    // Save payment record
    await Payment.create({
      order: order._id,
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.pricing.total,
      status: 'created'
    });

    // Update order with razorpay order id
    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        _id: order._id,
        orderId: order.orderId,
        amount: order.pricing.total,
        currency: 'INR'
      },
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed - invalid signature' });
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // Update order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.payment.status = 'paid';
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.paidAt = new Date();
    order.orderStatus = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received successfully' });
    await order.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
        method: paymentDetails.method,
        bank: paymentDetails.bank,
        wallet: paymentDetails.wallet,
        vpa: paymentDetails.vpa,
        paidAt: new Date()
      }
    );

    // Trigger confirmation email after payment success
    triggerOrderConfirmationEmail(order._id);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order.orderId,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Handle payment failure
// @route   POST /api/payments/failure
exports.paymentFailure = async (req, res) => {
  try {
    const { orderId, error } = req.body;
    const order = await Order.findById(orderId);
    if (order) {
      order.payment.status = 'failed';
      order.statusHistory.push({ status: 'processing', note: `Payment failed: ${error?.description || 'Unknown error'}` });
      await order.save();
    }
    await Payment.findOneAndUpdate(
      { order: orderId },
      { status: 'failed', errorCode: error?.code, errorDescription: error?.description }
    );
    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:orderId
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId }).populate('order');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook
exports.razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    if (event === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.notes?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          'payment.status': 'paid',
          'payment.razorpayPaymentId': paymentId,
          orderStatus: 'confirmed'
        });
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

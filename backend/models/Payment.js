const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  method: String,
  bank: String,
  wallet: String,
  vpa: String,
  email: String,
  contact: String,
  errorCode: String,
  errorDescription: String,
  refundId: String,
  refundAmount: Number,
  refundStatus: String,
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

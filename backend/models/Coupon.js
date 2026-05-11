const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  userUsageLimit: { type: Number, default: 1 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function(orderAmount, userId) {
  const now = new Date();
  const expiry = this.validUntil || this.expiresAt;
  if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
  if (now < this.validFrom) return { valid: false, message: 'Coupon is not yet valid' };
  if (expiry && now > expiry) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };
  if (userId && this.usedBy.includes(userId)) return { valid: false, message: 'You have already used this coupon' };
  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);

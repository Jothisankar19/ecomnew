const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
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
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFestivalPromo: {
    type: Boolean,
    default: false
  },
  showBanner: {
    type: Boolean,
    default: false
  },
  bannerText: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { timestamps: true });

// Unified Coupon & Flash Voucher Eligibility Checker
couponSchema.methods.isValid = function(orderAmount, userId) {
  const now = new Date();
  
  if (!this.isActive) {
    return { valid: false, message: 'This coupon code is currently inactive.' };
  }
  
  // Start Time scheduler check
  if (this.validFrom && now < this.validFrom) {
    return { valid: false, message: 'This coupon campaign has not started yet.' };
  }
  
  // Expire Time check
  const expiry = this.validUntil || this.expiresAt;
  if (expiry && now > expiry) {
    return { valid: false, message: 'This coupon has expired.' };
  }
  
  // Max claim stocks quota check
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon out of stock! All claims have been exhausted.' };
  }
  
  // Minimum cart verification
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, message: `Minimum cart subtotal of ₹${this.minOrderAmount} required.` };
  }
  
  // Limit 1 claim per customer account
  if (userId) {
    const hasUsed = this.usedBy.some(uId => uId.toString() === userId.toString());
    if (hasUsed) {
      return { valid: false, message: 'You have already claimed this coupon code. Limit 1 claim per account.' };
    }
  }
  
  return { valid: true };
};

// Calculate targeted category-restricted or product-restricted price reduction
couponSchema.methods.calculateDiscount = function(cartItems = [], orderAmount = 0) {
  let discount = 0;
  
  const hasCategoryRestriction = this.applicableCategories && this.applicableCategories.length > 0;
  const hasProductRestriction = this.applicableProducts && this.applicableProducts.length > 0;
  
  let eligibleAmount = orderAmount;
  
  if (hasCategoryRestriction || hasProductRestriction) {
    const eligibleItems = (cartItems || []).filter(item => {
      const product = item.product || {};
      const prodId = (product._id || product).toString();
      const catId = (item.category?._id || item.category || product.category?._id || product.category || '').toString();
      
      const matchesCategory = !hasCategoryRestriction || 
        this.applicableCategories.some(cat => cat.toString() === catId);
      const matchesProduct = !hasProductRestriction || 
        this.applicableProducts.some(p => p.toString() === prodId);
        
      return matchesCategory && matchesProduct;
    });
    
    eligibleAmount = eligibleItems.reduce((sum, item) => {
      const price = item.price || (item.product?.discountPrice || item.product?.price || 0);
      return sum + (price * item.quantity);
    }, 0);
  }

  if (this.discountType === 'percentage') {
    discount = (eligibleAmount * this.discountValue) / 100;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);

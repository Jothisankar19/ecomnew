const mongoose = require('mongoose');

const flashVoucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minCartValue: {
    type: Number,
    default: 0
  },
  maxDiscountLimit: {
    type: Number,
    default: null
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'expired'],
    default: 'scheduled'
  },
  totalStock: {
    type: Number,
    required: true,
    default: 100
  },
  stockClaimed: {
    type: Number,
    default: 0
  },
  isFestivalPromo: {
    type: Boolean,
    default: false
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Check if voucher is valid
flashVoucherSchema.methods.isValid = function(userId, cartAmount) {
  const now = new Date();
  
  if (this.status === 'expired' || now > this.endTime) {
    return { valid: false, message: 'This flash voucher has expired.' };
  }
  if (this.status === 'scheduled' || now < this.startTime) {
    return { valid: false, message: 'This flash sale has not started yet.' };
  }
  if (this.stockClaimed >= this.totalStock) {
    return { valid: false, message: 'Voucher out of stock! All claims have been exhausted.' };
  }
  if (cartAmount < this.minCartValue) {
    return { valid: false, message: `Minimum cart value of ₹${this.minCartValue} required.` };
  }
  
  if (userId) {
    const hasUsed = this.usedBy.some(uId => uId.toString() === userId.toString());
    if (hasUsed) {
      return { valid: false, message: 'You have already claimed this flash voucher. Limit 1 per account.' };
    }
    
    if (this.allowedUsers && this.allowedUsers.length > 0) {
      const isAllowed = this.allowedUsers.some(uId => uId.toString() === userId.toString());
      if (!isAllowed) {
        return { valid: false, message: 'This voucher is not applicable to your account.' };
      }
    }
  }
  
  return { valid: true };
};

// Calculate exact voucher discount based on cart products
flashVoucherSchema.methods.calculateDiscount = function(cartItems = [], totalAmount = 0) {
  let discount = 0;
  
  // Filter eligible items
  const eligibleItems = cartItems.filter(item => {
    const product = item.product || {};
    const prodId = (product._id || product).toString();
    const catId = (item.category?._id || item.category || product.category?._id || product.category || '').toString();
    
    const matchesCategory = this.applicableCategories.length === 0 || 
      this.applicableCategories.some(cat => cat.toString() === catId);
    const matchesProduct = this.applicableProducts.length === 0 || 
      this.applicableProducts.some(p => p.toString() === prodId);
      
    return matchesCategory && matchesProduct;
  });

  const eligibleAmount = eligibleItems.reduce((sum, item) => {
    const price = item.price || (item.product?.discountPrice || item.product?.price || 0);
    return sum + (price * item.quantity);
  }, 0);

  const baseAmount = this.applicableCategories.length > 0 || this.applicableProducts.length > 0 ? eligibleAmount : totalAmount;

  if (this.discountType === 'percentage') {
    discount = (baseAmount * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  if (this.maxDiscountLimit) {
    discount = Math.min(discount, this.maxDiscountLimit);
  }

  return Math.min(discount, totalAmount);
};

module.exports = mongoose.model('FlashVoucher', flashVoucherSchema);

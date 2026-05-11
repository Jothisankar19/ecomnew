const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    size: String,
    color: String,
    customization: {
      embroideryText: String,
      sleeveType: String,
      fabricStyle: String,
      giftWrapping: { type: Boolean, default: false }
    },
    savedForLater: { type: Boolean, default: false }
  }],
  coupon: {
    code: String,
    discount: Number,
    discountType: { type: String, enum: ['percentage', 'fixed'] }
  }
}, { timestamps: true });

// Virtual for total
cartSchema.virtual('totalItems').get(function() {
  return this.items.filter(i => !i.savedForLater).reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);

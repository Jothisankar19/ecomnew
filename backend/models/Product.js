const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  shortDescription: String,
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: String,
  brand: { type: String, default: 'Ethnic Elegance' },
  images: [{
    public_id: String,
    url: { type: String, required: true },
    alt: String
  }],
  colors: [{
    name: String,
    hex: String,
    images: [String]
  }],
  sizes: [{
    size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'] },
    stock: { type: Number, default: 0 },
    measurements: {
      chest: String,
      waist: String,
      hip: String,
      length: String
    }
  }],
  fabric: String,
  care: [String],
  features: [String],
  tags: [String],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  sold: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  customization: {
    embroidery: { type: Boolean, default: false },
    sleeveTypes: [String],
    fabricOptions: [String],
    giftWrapping: { type: Boolean, default: false }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  weight: Number,
  dimensions: {
    length: Number,
    'inline-size': Number,
    'block-size': Number
  },
  deliveryFee: { type: Number, default: 0 },
  gstRate: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-generate slug and calculate discount
productSchema.pre('validate', async function(next) {
  if (this.isModified('name')) {
    // Clean slug from name
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    // Check if slug already exists, append short suffix if needed
    const existing = await mongoose.model('Product').findOne({
      slug: baseSlug,
      _id: { $ne: this._id }
    })
    this.slug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug
  }
  // Auto-calculate discount percent
  if (this.price && this.discountPrice) {
    if (this.discountPrice < this.price) {
      this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100)
    } else {
      this.discountPercent = 0
      this.discountPrice = undefined
    }
  } else {
    this.discountPercent = 0
  }
  next()
})

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Indexes for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isTrending: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });

module.exports = mongoose.model('Product', productSchema);

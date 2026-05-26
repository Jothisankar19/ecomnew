const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  freeDeliveryThreshold: {
    type: Number,
    default: 1000,
    required: true
  },
  freeDeliveryLocations: {
    type: [String],
    default: ["Chennai", "Mumbai", "Delhi", "Kolkata", "Bengaluru"]
  },
  promoBanners: [{
    img: { url: String, public_id: String },
    tag: String,
    title: String,
    cta: String,
    link: String,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
  }],
  occasionBanners: [{
    name: String,
    subtitle: String,
    desc: String,
    badge: String,
    img: { url: String, public_id: String },
    link: String,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
  }],
  sizeGuide: {
    tag: { type: String, default: 'Size Guide' },
    title: { type: String, default: 'Find Your Perfect Fit' },
    description: { type: String, default: 'All our kurtis are available in XS to XXXL and Free Size' },
    note: { type: String, default: '* Measurements are in inches · Sizes may vary slightly by style · Standard Indian Fitting' },
    image: { url: String, public_id: String },
    sizes: [{
      size: String,
      chest: String,
      waist: String,
      hip: String,
      length: String
    }]
  },
  testimonialsSection: {
    tag: { type: String, default: 'Customer Love' },
    title: { type: String, default: 'What Our Customers Say' },
    description: { type: String, default: '' }
  },
  testimonials: [{
    name: String,
    city: String,
    rating: { type: Number, default: 5 },
    text: String,
    product: String,
    avatar: String,
    photo: { url: String, public_id: String },
    isActive: { type: Boolean, default: true }
  }],
  videoSection: {
    badge: { type: String, default: 'Featured Video' },
    title: { type: String, default: 'A Glimpse Of Our Craft' },
    description: { type: String, default: 'Experience the meticulous attention to detail and hand-crafted precision that goes into every single kurti we create. From selecting the finest fabrics to the final intricate stitches, our artisans pour their heart into delivering timeless elegance you can wear.' },
    videoUrl: { type: String, default: '' },
    video: { url: String, public_id: String }
  },
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    template: { type: String, default: 'classic', enum: ['classic', 'elegant', 'festive', 'minimal', 'night'] },
    title: { type: String, default: 'We\'ll Be Back Soon' },
    message: { type: String, default: 'Our store is undergoing scheduled updates. Thank you for your patience.' },
    estimatedReturn: { type: String, default: '' }
  },
  categoryGoals: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    targetUnits: { type: Number, default: 0 },
    targetRevenue: { type: Number, default: 0 },
    surpriseTitle: { type: String, default: 'Goal Achieved! 🎉' },
    surpriseDescription: { type: String, default: 'Unlock your surprise reward for this category.' },
    inspirationQuote: { type: String, default: 'Small steps weave big celebrations.' },
    isActive: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);

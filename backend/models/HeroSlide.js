const mongoose = require('mongoose');

const HeroSlideSchema = new mongoose.Schema({
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  subtitle: { type: String, default: '' },
  title: { type: String, default: 'Explore Trendy' },
  highlight: { type: String, default: 'Kurti Collections' },
  badge: { type: String, default: 'Flat 50% OFF' },
  cta: { type: String, default: 'Shop Now' },
  link: { type: String, default: '/products' },
  textPosition: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('HeroSlide', HeroSlideSchema);

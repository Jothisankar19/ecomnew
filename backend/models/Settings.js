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
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);

const Settings = require('../models/Settings');

// @desc    Get system settings (public)
// @route   GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system settings (admin only)
// @route   PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const { freeDeliveryThreshold, freeDeliveryLocations } = req.body;

    if (freeDeliveryLocations && freeDeliveryLocations.length > 5) {
      return res.status(400).json({ success: false, message: 'Free delivery can be configured for at most 5 locations.' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (freeDeliveryThreshold !== undefined) settings.freeDeliveryThreshold = freeDeliveryThreshold;
    if (freeDeliveryLocations !== undefined) settings.freeDeliveryLocations = freeDeliveryLocations.map(loc => loc.trim());

    await settings.save();

    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

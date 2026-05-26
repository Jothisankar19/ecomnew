const Settings = require('../models/Settings');
const cache = require('../utils/cache');

const MAINTENANCE_TEMPLATES = ['classic', 'elegant', 'festive', 'minimal', 'night'];

// @desc    Maintenance status (public, lightweight)
// @route   GET /api/settings/maintenance
exports.getMaintenanceStatus = async (req, res) => {
  try {
    let settings = await Settings.findOne().select('maintenanceMode');
    if (!settings) settings = await Settings.create({});
    const m = settings.maintenanceMode || {};
    res.json({
      success: true,
      maintenance: {
        enabled: !!m.enabled,
        template: MAINTENANCE_TEMPLATES.includes(m.template) ? m.template : 'classic',
        title: m.title || 'We\'ll Be Back Soon',
        message: m.message || 'Our store is undergoing scheduled updates.',
        estimatedReturn: m.estimatedReturn || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system settings (public)
// @route   GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const cached = await cache.get('system_settings');
    if (cached) {
      return res.json({ success: true, settings: cached });
    }
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({});
    }
    const payload = settings.toObject ? settings.toObject() : settings;
    await cache.set('system_settings', payload, 600);
    res.json({ success: true, settings: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system settings (admin only)
// @route   PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const {
      freeDeliveryThreshold, freeDeliveryLocations, promoBanners, occasionBanners,
      sizeGuide, testimonials, testimonialsSection, videoSection,
      maintenanceMode, categoryGoals
    } = req.body;

    if (freeDeliveryLocations && freeDeliveryLocations.length > 5) {
      return res.status(400).json({ success: false, message: 'Free delivery can be configured for at most 5 locations.' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (freeDeliveryThreshold !== undefined) settings.freeDeliveryThreshold = freeDeliveryThreshold;
    if (freeDeliveryLocations !== undefined) settings.freeDeliveryLocations = freeDeliveryLocations.map(loc => loc.trim());
    if (promoBanners !== undefined) {
      settings.promoBanners = promoBanners.map(b => ({
        ...b,
        categoryId: b.categoryId === '' ? null : b.categoryId
      }));
    }
    if (occasionBanners !== undefined) {
      settings.occasionBanners = occasionBanners.map(b => ({
        ...b,
        categoryId: b.categoryId === '' ? null : b.categoryId
      }));
    }
    if (sizeGuide !== undefined) {
      settings.sizeGuide = {
        ...settings.sizeGuide?.toObject?.() ?? {},
        ...sizeGuide
      };
    }
    if (testimonialsSection !== undefined) {
      settings.testimonialsSection = {
        ...settings.testimonialsSection?.toObject?.() ?? {},
        ...testimonialsSection
      };
    }
    if (testimonials !== undefined) {
      settings.testimonials = testimonials
        .filter((review) => String(review.name || '').trim() && String(review.text || '').trim())
        .map((review) => ({
          name: String(review.name || '').trim(),
          city: String(review.city || '').trim(),
          product: String(review.product || '').trim(),
          text: String(review.text || '').trim(),
          avatar: String(review.avatar || review.name?.charAt(0) || '?').slice(0, 1).toUpperCase(),
          rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
          photo: review.photo?.url ? { url: review.photo.url, public_id: review.photo.public_id || '' } : undefined,
          isActive: review.isActive !== false
        }));
    }
    if (videoSection !== undefined) {
      settings.videoSection = {
        ...settings.videoSection?.toObject?.() ?? {},
        ...videoSection
      };
    }
    if (maintenanceMode !== undefined) {
      const next = { ...settings.maintenanceMode?.toObject?.() ?? {}, ...maintenanceMode };
      if (next.template && !MAINTENANCE_TEMPLATES.includes(next.template)) {
        next.template = 'classic';
      }
      settings.maintenanceMode = next;
    }
    if (categoryGoals !== undefined) {
      settings.categoryGoals = categoryGoals.map((g) => ({
        categoryId: g.categoryId || null,
        targetUnits: Math.max(0, Number(g.targetUnits) || 0),
        targetRevenue: Math.max(0, Number(g.targetRevenue) || 0),
        surpriseTitle: g.surpriseTitle || 'Goal Achieved! 🎉',
        surpriseDescription: g.surpriseDescription || '',
        inspirationQuote: g.inspirationQuote || '',
        isActive: g.isActive !== false
      })).filter((g) => g.categoryId);
    }

    await settings.save();
    await cache.del('system_settings');

    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

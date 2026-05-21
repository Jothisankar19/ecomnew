const HeroSlide = require('../models/HeroSlide');
const cloudinary = require('../config/cloudinary');

// @desc    Get active hero slides (Public)
// @route   GET /api/hero-slides
// @access  Public
exports.getActiveSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, count: slides.length, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all hero slides (Admin)
// @route   GET /api/hero-slides/all
// @access  Private/Admin
exports.getAllSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({}).sort({ order: 1 });
    res.json({ success: true, count: slides.length, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new hero slide (Admin)
// @route   POST /api/hero-slides
// @access  Private/Admin
exports.createSlide = async (req, res) => {
  try {
    const { image, subtitle, title, highlight, badge, cta, link, textPosition, active, order } = req.body;

    if (!image || !image.url || !image.public_id) {
      return res.status(400).json({ success: false, message: 'Slide image is required' });
    }

    const slide = await HeroSlide.create({
      image,
      subtitle,
      title,
      highlight,
      badge,
      cta,
      link,
      textPosition: textPosition || 'center',
      active,
      order: order || 0
    });

    res.status(201).json({ success: true, slide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hero slide (Admin)
// @route   PUT /api/hero-slides/:id
// @access  Private/Admin
exports.updateSlide = async (req, res) => {
  try {
    const { image, subtitle, title, highlight, badge, cta, link, textPosition, active, order } = req.body;

    let slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }

    // If a new image was uploaded and it's different, clean up the old Cloudinary image
    if (image && image.public_id && image.public_id !== slide.image.public_id) {
      try {
        await cloudinary.uploader.destroy(slide.image.public_id);
      } catch (cloudinaryErr) {
        console.error('Failed to delete old image from Cloudinary:', cloudinaryErr.message);
      }
    }

    slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      { image, subtitle, title, highlight, badge, cta, link, textPosition, active, order },
      { new: true, runValidators: true }
    );

    res.json({ success: true, slide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete hero slide (Admin)
// @route   DELETE /api/hero-slides/:id
// @access  Private/Admin
exports.deleteSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }

    // Clean up image from Cloudinary
    try {
      await cloudinary.uploader.destroy(slide.image.public_id);
    } catch (cloudinaryErr) {
      console.error('Failed to delete image from Cloudinary:', cloudinaryErr.message);
    }

    await slide.deleteOne();
    res.json({ success: true, message: 'Hero slide removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle hero slide active status (Admin)
// @route   PATCH /api/hero-slides/:id/active
// @access  Private/Admin
exports.toggleSlideActive = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }

    slide.active = !slide.active;
    await slide.save();

    res.json({ success: true, slide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update slides ordering (Admin)
// @route   PUT /api/hero-slides/order
// @access  Private/Admin
exports.updateSlidesOrder = async (req, res) => {
  try {
    const { orderings } = req.body; // Array of { id, order }

    if (!orderings || !Array.isArray(orderings)) {
      return res.status(400).json({ success: false, message: 'Orderings array is required' });
    }

    const promises = orderings.map(item => 
      HeroSlide.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(promises);
    res.json({ success: true, message: 'Slides reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

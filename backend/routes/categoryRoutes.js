const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Category = require('../models/Category');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const cache = require('../utils/cache');

router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    if (!isAdmin) {
      const cached = await cache.get('categories_public');
      if (cached) {
        return res.json({ success: true, categories: cached });
      }
    }
    const query = isAdmin ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    if (!isAdmin) {
      await cache.set('categories_public', categories, 600); // 10 minutes cache
    }
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get by slug (must be before /:id)
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'ethnic-elegance/categories' }, (err, res) => {
          if (err) reject(err); else resolve(res);
        });
        stream.end(req.file.buffer);
      });
      data.image = { public_id: result.public_id, url: result.secure_url };
    }
    const category = await Category.create(data);
    await cache.del('categories_public');
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'ethnic-elegance/categories' }, (err, res) => {
          if (err) reject(err); else resolve(res);
        });
        stream.end(req.file.buffer);
      });
      data.image = { public_id: result.public_id, url: result.secure_url };
    }
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
    await cache.del('categories_public');
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    await cache.del('categories_public');
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

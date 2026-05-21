const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getActiveSlides,
  getAllSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  toggleSlideActive,
  updateSlidesOrder
} = require('../controllers/heroSlideController');

// Public route to get active slides
router.get('/', getActiveSlides);

// Admin-only routes
router.get('/all', protect, adminOnly, getAllSlides);
router.post('/', protect, adminOnly, createSlide);
router.put('/order', protect, adminOnly, updateSlidesOrder);
router.put('/:id', protect, adminOnly, updateSlide);
router.delete('/:id', protect, adminOnly, deleteSlide);
router.patch('/:id/active', protect, adminOnly, toggleSlideActive);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getFeaturedProducts, getRelatedProducts, searchProducts
} = require('../controllers/productController');

router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.post('/', protect, adminOnly, upload.array('images', 10), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;

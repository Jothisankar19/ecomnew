const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret'
  );
};

router.post('/', protect, adminOnly, upload.array('files', 10), async (req, res) => {
  try {
    // Clear error if Cloudinary not configured
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file. Get free credentials at https://cloudinary.com'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const folder = req.body.folder || 'ethnic-elegance/products';
    const isBanner = folder.includes('banners');
    const transformation = isBanner
      ? [{ width: 2000, height: 1000, crop: 'limit', quality: 'auto:best', fetch_format: 'auto' }]
      : [{ width: 800, height: 1000, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }];

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            transformation
          },
          (err, result) => {
            if (err) reject(err);
            else resolve({ public_id: result.public_id, url: result.secure_url });
          }
        );
        stream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    res.json({ success: true, files: results });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message.includes('api_key') || error.message.includes('cloud_name')
        ? 'Invalid Cloudinary credentials. Check your .env file.'
        : error.message
    });
  }
});

router.delete('/', protect, adminOnly, async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ success: false, message: 'public_id required' });
    await cloudinary.uploader.destroy(public_id);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

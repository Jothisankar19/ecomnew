const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update avatar
router.put('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ethnic-elegance/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
        (err, res) => { if (err) reject(err); else resolve(res); }
      );
      stream.end(req.file.buffer);
    });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { public_id: result.public_id, url: result.secure_url } },
      { new: true }
    );
    res.json({ success: true, message: 'Avatar updated', avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add address (support both /address and /addresses)
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, message: 'Address added', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add address
router.post('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, message: 'Address added', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update address
router.put('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach(addr => addr.isDefault = false);
    Object.assign(address, req.body);
    await user.save();
    res.json({ success: true, message: 'Address updated', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete address (support both /address and /addresses)
router.delete('/address/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json({ success: true, message: 'Address deleted', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete address
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json({ success: true, message: 'Address deleted', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

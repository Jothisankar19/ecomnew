const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, logout, getMe, verifyOTP,
  forgotPassword, resetPassword, updatePassword, googleLogin
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.post('/google', googleLogin);

module.exports = router;

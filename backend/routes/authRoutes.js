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
router.post('/resend-otp', async (req, res) => {
  try {
    const User = require('../models/User');
    const { sendEmail } = require('../utils/sendEmail');
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    const otp = user.generateOTP();
    await user.save();
    sendEmail({
      from: `"Kurti Elegance" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New OTP — Kurti Elegance',
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#fff;border-radius:12px;border:1px solid #eee">
        <h2 style="color:#D4AF37;text-align:center">New OTP</h2>
        <p>Hi <strong>${user.name}</strong>, here is your new OTP:</p>
        <div style="text-align:center;margin:24px 0">
          <span style="font-size:42px;font-weight:bold;letter-spacing:14px;color:#D4AF37;background:#fef9ec;padding:16px 24px;border-radius:10px;border:2px dashed #D4AF37">${otp}</span>
        </div>
        <p style="color:#999;font-size:13px;text-align:center">Expires in 10 minutes.</p>
      </div>`
    }).catch(() => {});
    res.json({ success: true, message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.post('/google', googleLogin);

module.exports = router;

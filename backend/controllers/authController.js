const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail, getWelcomeTemplate } = require('../utils/sendEmail');

const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    // Create user — verified immediately, direct login
    const user = await User.create({ name, email, password, phone, isVerified: true });

    // Send welcome email in background
    sendEmail({
      from: `"Kurti Elegance" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Kurti Elegance!',
      html: getWelcomeTemplate({ name, email })
    }).catch(() => {});

    sendToken(user, 201, res, `Welcome to Kurti Elegance, ${name}!`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Update last login (non-blocking)
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(() => {});
    sendToken(user, 200, res, 'Login successful');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    const user = await User.findOne({ email, otp: hashedOTP, otpExpire: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Send welcome email after successful verification
    sendEmail({
      from: `"Kurti Elegance" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Kurti Elegance!',
      html: getWelcomeTemplate({ name: user.name, email })
    }).catch(() => {});

    // Return full auth token — user is now fully logged in
    sendToken(user, 200, res, `Welcome to Kurti Elegance, ${user.name}! Your account is verified.`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        from: `"Kurti Elegance" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset - Kurti Elegance',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#D4AF37">Reset Your Password</h2>
          <p>Click the button below to reset your password. This link is valid for 15 minutes.</p>
          <a href="${resetUrl}" style="background:#D4AF37;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Reset Password</a>
        </div>`
      });
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res, 'Password reset successful');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res, 'Password updated successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar: { url: avatar }, isVerified: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    user.lastLogin = new Date();
    await user.save();
    sendToken(user, 200, res, 'Google login successful');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

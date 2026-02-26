const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PgUser = require('../models/PgUser');
const PgSession = require('../models/PgSession');
const { sendOTPEmail } = require('../config/email');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/signup', async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email || !fullName || !password) {
      return res.status(400).json({ message: 'Email, full name, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user = await PgUser.findOne({ where: { email } });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'User already exists. Please login.' });
      } else {
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({ otp, otpExpiry });
        await sendOTPEmail(email, otp, fullName);

        return res.status(200).json({
          message: 'OTP resent to your email',
          email: user.email,
          requiresVerification: true
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user = await PgUser.create({
      email,
      fullName,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false
    });

    await sendOTPEmail(email, otp, fullName);

    res.status(201).json({
      message: 'Account created successfully. Please verify your email with the OTP sent.',
      email: user.email,
      requiresVerification: true
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await PgUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified. Please login.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    await user.update({
      isVerified: true,
      otp: null,
      otpExpiry: null
    });

    res.status(200).json({
      message: 'Email verified successfully. You can now login.',
      email: user.email
    });
  } catch (err) {
    console.error('OTP verification error:', err.message);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await PgUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified. Please login.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp, otpExpiry });
    await sendOTPEmail(email, otp, user.fullName);

    res.status(200).json({
      message: 'OTP resent to your email',
      email: user.email
    });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await PgUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first before resetting password' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp, otpExpiry });
    await sendOTPEmail(email, otp, user.fullName);

    res.status(200).json({
      message: 'Password reset OTP sent to your email',
      email: user.email
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await PgUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      password: hashedPassword,
      otp: null,
      otpExpiry: null
    });

    await PgSession.destroy({ where: { userId: user.id } });

    res.status(200).json({
      message: 'Password reset successfully. Please login with your new password.',
      email: user.email
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await PgUser.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: 'Please verify your email first',
        requiresVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
      { expiresIn: '7d' }
    );

    await PgSession.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;

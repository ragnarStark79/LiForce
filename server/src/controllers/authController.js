import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const refreshToken = jwt.sign({ userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, address, city, state, zipCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      bloodGroup,
      address,
      city,
      state,
      zipCode,
      role: 'USER',
      status: 'ACTIVE',
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Staff
export const registerStaff = async (req, res) => {
  try {
    const { name, email, password, phone, hospitalId, staffPosition, department } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(400).json({ message: 'Invalid hospital ID. Please select a valid hospital.' });
    }

    // Create staff user with PENDING status
    const user = await User.create({
      name,
      email,
      password,
      phone,
      hospitalId,
      staffPosition,
      department,
      role: 'STAFF',
      status: 'PENDING', // Staff must be approved by admin
    });

    res.status(201).json({
      message: 'Staff registration submitted. Please wait for admin approval.',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password').populate('hospitalId');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check staff status - STAFF can only login if APPROVED
    if (user.role === 'STAFF') {
      if (user.status === 'PENDING') {
        return res.status(403).json({ 
          message: 'Your account is pending approval. Please wait for admin to approve your registration.',
          code: 'STAFF_PENDING'
        });
      }
      if (user.status === 'REJECTED') {
        return res.status(403).json({ 
          message: 'Your account has been rejected. Please contact the administrator for more information.',
          code: 'STAFF_REJECTED'
        });
      }
      if (user.status === 'SUSPENDED') {
        return res.status(403).json({ 
          message: 'Your account has been suspended. Please contact the administrator.',
          code: 'STAFF_SUSPENDED'
        });
      }
      if (user.status !== 'APPROVED') {
        return res.status(403).json({ 
          message: 'Your account is not active. Please contact the administrator.',
          code: 'STAFF_INACTIVE'
        });
      }
    }

    // Check user status - USER and ADMIN should be ACTIVE
    if ((user.role === 'USER' || user.role === 'ADMIN') && user.status === 'SUSPENDED') {
      return res.status(403).json({ 
        message: 'Your account has been suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.json({
      message: 'Login successful',
      user,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // Clear refresh token
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    // TODO: Implement email verification token logic
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TODO: Generate reset token and send email
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    // TODO: Verify reset token and update password
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

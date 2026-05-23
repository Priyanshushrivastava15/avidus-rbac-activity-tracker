const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logActivity = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_rbac_tracker_token_key_123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role - default to 'User', allow 'Admin' choice for easy assessment testing
    const userRole = role === 'Admin' ? 'Admin' : 'User';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    if (user) {
      await logActivity(user._id, 'Login Success', `Account created & logged in for ${user.email} (${user.role})`, req, user.email);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await logActivity(null, 'Login Failed', `Failed login attempt: Email ${email} not registered`, req, email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify user is active
    if (user.status !== 'Active') {
      await logActivity(user._id, 'Login Failed', `Blocked login attempt: User ${email} is inactive`, req, email);
      return res.status(403).json({ message: 'Your account is inactive. Please contact an admin.' });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logActivity(user._id, 'Login Failed', `Failed login attempt: Incorrect password for user ${email}`, req, email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Success login
    await logActivity(user._id, 'Login Success', `User logged in successfully: ${user.email}`, req, user.email);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};

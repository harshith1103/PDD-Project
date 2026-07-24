const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const User = require('../models/User');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/i).withMessage('Email must be an official @gmail.com address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('role').isIn(['donor', 'volunteer', 'recipient', 'admin']).withMessage('Valid role is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: errors.array()[0].msg,
      });
    }

    const { name, email, password, role, phone, address, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'User with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || '',
      address: address || '',
      location: location || { lat: 0, lng: 0 },
      createdAt: new Date(),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          location: user.location,
        },
      },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          location: user.location,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error during login',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
      message: 'User profile retrieved',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error',
    });
  }
};

module.exports = { register, login, getMe, registerValidation, loginValidation };

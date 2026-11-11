
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate a JWT for the authenticated user
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
      algorithm: 'HS256'
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: 'Valid name, email and password of at least 8 characters are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({
      email: normalizedEmail
    });

    if (userExists) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid registration details'
      });
    }

    console.error('Registration error:', error);

    res.status(500).json({
      message: 'Server error during registration'
    });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (
      !user ||
      !(await user.matchPassword(password))
    ) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error during login'
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};

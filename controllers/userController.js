const mongoose = require('mongoose');

// Safely load User model (prevents crash before Member 2 merges models/User.js)
const getUserModel = () => {
  if (mongoose.models.User) return mongoose.models.User;
  try {
    return require('../models/User');
  } catch (err) {
    return null;
  }
};

// @desc    Get all users (for ticket assignment dropdowns / admin view)
// @route   GET /api/users
// @access  Private / Public (First Release)
const getAllUsers = async (req, res) => {
  try {
    const User = getUserModel();
    if (!User) {
      return res.status(503).json({ message: 'User model not yet initialized' });
    }

    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
};

// @desc    Get current logged-in user profile (or by ID param)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const User = getUserModel();
    if (!User) {
      return res.status(503).json({ message: 'User model not yet initialized' });
    }

    // Uses req.user.id from Member 2's authMiddleware, or falls back to query/param ID
    const userId = req.user?.id || req.user?._id || req.query.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided or user not authenticated' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const User = getUserModel();
    if (!User) {
      return res.status(503).json({ message: 'User model not yet initialized' });
    }

    const userId = req.user?.id || req.user?._id || req.body.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided or user not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.role) user.role = req.body.role;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const User = getUserModel();
    if (!User) {
      return res.status(503).json({ message: 'User model not yet initialized' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};
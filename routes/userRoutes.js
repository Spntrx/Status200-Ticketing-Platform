const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');

// Safely load authMiddleware once Member 2 merges it (falls back to passthrough if empty)
let protect = (req, res, next) => next();
try {
  const authMiddleware = require('../middleware/authMiddleware');
  if (typeof authMiddleware === 'function') {
    protect = authMiddleware;
  } else if (typeof authMiddleware?.protect === 'function') {
    protect = authMiddleware.protect;
  }
} catch (err) {
  // Middleware not yet implemented
}

// Routes mounted at /api/users
router.get('/', protect, getAllUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/:id', protect, deleteUser);

module.exports = router;
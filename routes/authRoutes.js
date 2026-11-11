
const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser
} = require('../controllers/authController');

const {
  protect
} = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route used to verify authentication
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;

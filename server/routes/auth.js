const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   GET api/auth/ping
// @desc    Check if the server is running
// @access  Public
router.get('/ping', (req, res) => {
  console.log('Ping request received');
  res.status(200).json({ message: 'Server is running' });
});

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, authController.getUser);

// @route   GET api/auth/test
// @desc    Test if authentication is working
// @access  Private
router.get('/test', auth, authController.testAuth);

module.exports = router;
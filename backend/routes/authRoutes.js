'use strict';

const { Router }       = require('express');
const controller       = require('../controllers/authController');
const validate         = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = Router();

/**
 * @route  POST /api/v1/auth/register
 * @desc   Create a new full-profile account
 * @access Public
 * @body   { name, email, password, dob?, age?, gender?, address? }
 */
router.post(
  '/register',
  validate(['name', 'email', 'password']),
  controller.register,
);

/**
 * @route  POST /api/v1/auth/login
 * @desc   Log in and receive a JWT
 * @access Public
 * @body   { email, password }
 */
router.post(
  '/login',
  validate(['email', 'password']),
  controller.login,
);

/**
 * @route  GET /api/v1/auth/profile
 * @desc   Get logged-in user's profile
 * @access Private (JWT required)
 */
router.get('/profile', authenticate, controller.getProfile);

/**
 * @route  PUT /api/v1/auth/profile
 * @desc   Update profile fields (name, dob, age, gender, address)
 * @access Private (JWT required)
 */
router.put('/profile', authenticate, controller.updateProfile);

// Legacy alias kept for backward compatibility
router.get('/protected', authenticate, controller.getProtected);

module.exports = router;

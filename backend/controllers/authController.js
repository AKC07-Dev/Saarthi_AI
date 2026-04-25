'use strict';

/**
 * authController.js
 *
 * POST /api/v1/auth/register  — Create account with full profile
 * POST /api/v1/auth/login     — Authenticate, get JWT
 * GET  /api/v1/auth/profile   — Return logged-in user's profile (protected)
 * PUT  /api/v1/auth/profile   — Update profile fields (protected)
 */

const authService                = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ─── Register ─────────────────────────────────────────────────────────────────

const register = async (req, res, next) => {
  try {
    const { name, dob, age, gender, address, email, password } = req.body;

    if (!email || !password || !name) {
      return sendError(res, {
        message: 'name, email, and password are required.',
        status:  400,
      });
    }

    const user = await authService.register({
      name, dob, age, gender, address, email, password,
    });

    return sendSuccess(res, {
      data:    user,
      message: 'Account created successfully. Please log in.',
      status:  201,
    });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, { message: err.message, status: err.statusCode });
    }
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, {
        message: 'email and password are required.',
        status:  400,
      });
    }

    const { token, user } = await authService.login({ email, password });

    return sendSuccess(res, {
      data:    { token, user },
      message: 'Login successful.',
    });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, { message: err.message, status: err.statusCode });
    }
    next(err);
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────

const getProfile = (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    const user = authService.getProfile(req.user.id);

    if (!user) {
      return sendError(res, { message: 'User not found.', status: 404 });
    }

    return sendSuccess(res, { data: { user }, message: 'Profile retrieved.' });
  } catch (err) {
    next(err);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────

const updateProfile = (req, res, next) => {
  try {
    const user = authService.updateProfile(req.user.id, req.body);

    if (!user) {
      return sendError(res, { message: 'User not found.', status: 404 });
    }

    return sendSuccess(res, { data: { user }, message: 'Profile updated.' });
  } catch (err) {
    next(err);
  }
};

// Legacy alias
const getProtected = getProfile;

module.exports = { register, login, getProfile, updateProfile, getProtected };

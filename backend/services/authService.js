'use strict';

/**
 * authService.js — Authentication service using JSON file persistence.
 *
 * Users stored in data/users.json.
 * Full schema: name, dob, age, gender, address, email, password (hashed).
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const UserModel = require('../models/User');

const SALT_ROUNDS = 12;

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ name, dob, age, gender, address, email, password }} payload
 * @returns {object} Safe user (no hash)
 */
const register = async ({ name, dob, age, gender, address, email, password }) => {
  if (!name || !email || !password) {
    const err = new Error('name, email, and password are required.');
    err.statusCode = 400;
    throw err;
  }

  if (UserModel.findByEmail(email)) {
    const err = new Error(`Email "${email}" is already registered.`);
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = UserModel.create({
    name,
    dob:    dob    || '',
    age:    age    ? parseInt(age, 10) : null,
    gender: gender || '',
    address: address || '',
    email,
    passwordHash,
    role: 'user',
  });

  return user;
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate and return a JWT + safe user.
 * @param {{ email, password }} payload
 * @returns {{ token: string, user: object }}
 */
const login = async ({ email, password }) => {
  const raw = UserModel.findByEmail(email);

  // Use constant-time compare; same error for unknown email vs wrong password
  const isMatch = raw ? await bcrypt.compare(password, raw.passwordHash) : false;

  if (!raw || !isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const payload = { sub: raw.id, email: raw.email, role: raw.role };
  const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Strip passwordHash before returning
  const { passwordHash: _ignored, ...safeUser } = raw;
  return { token, user: safeUser };
};

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * Retrieve user profile by id.
 * @param {number} id
 * @returns {object|null} Safe user
 */
const getProfile = (id) => {
  const raw = UserModel.findById(id);
  if (!raw) return null;
  const { passwordHash: _ignored, ...safeUser } = raw;
  return safeUser;
};

// ─── Update Profile ───────────────────────────────────────────────────────────

/**
 * Update allowed profile fields.
 * @param {number} id
 * @param {{ name?, dob?, age?, gender?, address? }} updates
 * @returns {object|null}
 */
const updateProfile = (id, updates) => {
  // Only allow safe fields — never email/role/password here
  const allowed = ['name', 'dob', 'age', 'gender', 'address'];
  const safe    = {};
  for (const k of allowed) {
    if (updates[k] !== undefined) safe[k] = updates[k];
  }
  return UserModel.update(id, safe);
};

module.exports = { register, login, getProfile, updateProfile };

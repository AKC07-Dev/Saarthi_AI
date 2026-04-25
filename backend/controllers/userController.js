'use strict';

const userService          = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * GET /api/v1/users
 * List all users.
 */
const getAllUsers = (req, res, next) => {
  try {
    const users = userService.findAll();
    sendSuccess(res, { data: users, message: 'Users retrieved successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/:id
 * Get a single user by ID.
 */
const getUserById = (req, res, next) => {
  try {
    const id   = parseInt(req.params.id, 10);
    const user = userService.findById(id);

    if (!user) {
      return sendError(res, { message: `User with id ${id} not found.`, status: 404 });
    }

    sendSuccess(res, { data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/users
 * Create a new user.
 * Required body fields: name, email
 */
const createUser = (req, res, next) => {
  try {
    const user = userService.create(req.body);
    sendSuccess(res, { data: user, message: 'User created successfully.', status: 201 });
  } catch (err) {
    // Propagate domain errors (e.g. duplicate email) with the right status code
    if (err.statusCode) {
      return sendError(res, { message: err.message, status: err.statusCode });
    }
    next(err);
  }
};

/**
 * PUT /api/v1/users/:id
 * Replace / partially update a user.
 */
const updateUser = (req, res, next) => {
  try {
    const id   = parseInt(req.params.id, 10);
    const user = userService.update(id, req.body);
    sendSuccess(res, { data: user, message: 'User updated successfully.' });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, { message: err.message, status: err.statusCode });
    }
    next(err);
  }
};

/**
 * DELETE /api/v1/users/:id
 * Remove a user.
 */
const deleteUser = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    userService.remove(id);
    sendSuccess(res, { message: `User ${id} deleted successfully.` });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, { message: err.message, status: err.statusCode });
    }
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };

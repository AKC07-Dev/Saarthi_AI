'use strict';

const jwt                    = require('jsonwebtoken');
const { JWT_SECRET }         = require('../config/env');
const { sendError }          = require('../utils/responseHelper');

/**
 * authenticate — JWT verification middleware.
 *
 * Reads the token from the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success  → attaches decoded payload to req.user and calls next().
 * On failure  → responds 401 immediately (never calls next).
 *
 * Usage:
 *   router.get('/protected', authenticate, controller.handler);
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, {
      message: 'Access denied. No token provided. Use: Authorization: Bearer <token>',
      status:  401,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded payload so controllers can read req.user
    req.user = {
      id:    decoded.sub,
      email: decoded.email,
      role:  decoded.role,
    };

    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return sendError(res, {
      message: isExpired ? 'Token has expired. Please log in again.' : 'Invalid token.',
      status:  401,
    });
  }
};

/**
 * authorise — Role-based access control middleware factory.
 *
 * Must be used AFTER authenticate.
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorise('admin'), controller.deleteUser);
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'user')
 * @returns {import('express').RequestHandler}
 */
const authorise = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, {
      message: 'Forbidden. You do not have permission to access this resource.',
      status:  403,
    });
  }
  next();
};

module.exports = { authenticate, authorise };

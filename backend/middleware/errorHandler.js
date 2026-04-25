'use strict';

const { NODE_ENV } = require('../config/env');

/**
 * 404 – No route matched.
 * Attach to the end of all route definitions.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * Global error handler.
 * Must be registered AFTER all routes and other middleware.
 * Express identifies it as an error handler because it has 4 parameters.
 *
 * @param {Error}           err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  const response = {
    success: false,
    status:  statusCode,
    message: err.message || 'Internal Server Error',
  };

  // Expose stack trace only in non-production environments
  if (NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} - ${err.message}`);

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };

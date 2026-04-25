'use strict';

const { sendError } = require('../utils/responseHelper');

/**
 * Middleware factory: validates that required fields are present in req.body.
 *
 * Usage:
 *   router.post('/', validate(['name', 'email']), controller.create);
 *
 * @param {string[]} requiredFields - Fields that must exist and be non-empty.
 * @returns {import('express').RequestHandler}
 */
const validate = (requiredFields = []) => (req, res, next) => {
  const errors = [];

  requiredFields.forEach((field) => {
    const value = req.body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push({ field, message: `"${field}" is required and cannot be empty.` });
    }
  });

  if (errors.length > 0) {
    return sendError(res, {
      message: 'Validation failed.',
      status:  422,
      errors,
    });
  }

  next();
};

module.exports = validate;

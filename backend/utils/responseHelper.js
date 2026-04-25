'use strict';

/**
 * Utility helpers to send consistently shaped API responses.
 *
 * Every response follows the envelope:
 * {
 *   success : boolean,
 *   message : string,
 *   data    : any | null,
 *   errors  : any | null   (only on failures)
 * }
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {any}    options.data       - Payload to return
 * @param {string} [options.message]  - Human-readable message
 * @param {number} [options.status]   - HTTP status code (default 200)
 */
const sendSuccess = (res, { data = null, message = 'Success', status = 200 } = {}) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} [options.message]  - Human-readable error
 * @param {number} [options.status]   - HTTP status code (default 500)
 * @param {any}    [options.errors]   - Detailed error info (e.g. validation errors)
 */
const sendError = (res, { message = 'Something went wrong', status = 500, errors = null } = {}) => {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  res.status(status).json(body);
};

module.exports = { sendSuccess, sendError };

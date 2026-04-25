'use strict';

const { getHealthStatus }        = require('../services/healthService');
const { sendSuccess }            = require('../utils/responseHelper');

/**
 * GET /health
 * Returns the current health status of the API.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const healthCheck = (req, res, next) => {
  try {
    const data = getHealthStatus();
    sendSuccess(res, { data, message: 'API is healthy.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { healthCheck };

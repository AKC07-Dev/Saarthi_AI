'use strict';

const morgan = require('morgan');
const { NODE_ENV } = require('../config/env');

/**
 * Request logger middleware.
 * Uses "dev" format in development for colourised, compact output,
 * and "combined" (Apache-style) in production for full audit logs.
 */
const requestLogger = morgan(NODE_ENV === 'production' ? 'combined' : 'dev');

module.exports = requestLogger;

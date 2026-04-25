'use strict';

require('dotenv').config();

/**
 * Central environment configuration.
 * All process.env access is funnelled through here so the
 * rest of the codebase never touches process.env directly.
 */
const env = {
  NODE_ENV:        process.env.NODE_ENV        || 'development',
  PORT:            parseInt(process.env.PORT, 10) || 5000,
  APP_NAME:        process.env.APP_NAME        || 'Saarthi-Backend',
  API_VERSION:     process.env.API_VERSION     || 'v1',
  JWT_SECRET:      process.env.JWT_SECRET      || 'fallback_dev_secret',
  JWT_EXPIRES_IN:  process.env.JWT_EXPIRES_IN  || '7d',
};

module.exports = env;

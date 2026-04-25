'use strict';

const { APP_NAME, NODE_ENV, API_VERSION } = require('../config/env');

/**
 * Returns a health-check payload.
 * Keeping this logic in a service keeps the controller thin
 * and makes it easy to add real checks (DB ping, cache ping, etc.) later.
 *
 * @returns {{ status: string, uptime: number, timestamp: string, app: string, env: string, version: string }}
 */
const getHealthStatus = () => ({
  status:    'ok',
  uptime:    Math.floor(process.uptime()),   // seconds since process started
  timestamp: new Date().toISOString(),
  app:       APP_NAME,
  env:       NODE_ENV,
  version:   API_VERSION,
});

module.exports = { getHealthStatus };

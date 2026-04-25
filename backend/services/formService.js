'use strict';

/**
 * formService.js — thin wrapper so formController.js has something to import.
 * The heavy lifting is done by autofillService.js (which formRoutes already uses).
 */

const { autofillForm } = require('./autofillService');

module.exports = { autofillForm };

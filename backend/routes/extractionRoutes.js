'use strict';

/**
 * extractionRoutes.js
 * Mounts field-extraction endpoints.
 *
 *   POST /api/v1/extract   → extractFromText
 */

const { Router }           = require('express');
const { extractFromText }  = require('../controllers/extractionController');

const router = Router();

// POST /api/v1/extract
router.post('/', extractFromText);

module.exports = router;

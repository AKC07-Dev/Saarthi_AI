'use strict';

/**
 * formRoutes.js
 * Mounts form-autofill endpoints.
 *
 *   POST /api/v1/autofill   → autofill controller
 */

const { Router }   = require('express');
const { autofill } = require('../controllers/autofillController');

const router = Router();

// POST /api/v1/autofill
router.post('/autofill', autofill);

module.exports = router;

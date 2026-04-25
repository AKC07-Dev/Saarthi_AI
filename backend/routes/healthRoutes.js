'use strict';

const { Router } = require('express');
const { healthCheck } = require('../controllers/healthController');

const router = Router();

/**
 * @route  GET /health
 * @desc   API health check
 * @access Public
 */
router.get('/', healthCheck);

module.exports = router;

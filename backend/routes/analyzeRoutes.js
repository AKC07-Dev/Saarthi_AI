'use strict';

const { Router } = require('express');
const { analyzeText } = require('../controllers/analyzeController');

const router = Router();

// POST /api/v1/analyze
router.post('/', analyzeText);

module.exports = router;

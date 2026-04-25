'use strict';

const { Router }          = require('express');
const translateController = require('../controllers/translateController');

const router = Router();

// POST /api/v1/translate
router.post('/', translateController.translate);

module.exports = router;

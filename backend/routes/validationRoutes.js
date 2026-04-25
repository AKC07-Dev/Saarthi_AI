'use strict';

const { Router } = require('express');
const { validateForm } = require('../controllers/validationController');

const router = Router();

// POST /api/v1/validate
router.post('/', validateForm);

module.exports = router;

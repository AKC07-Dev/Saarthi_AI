'use strict';

const { Router }     = require('express');
const ragController  = require('../controllers/ragController');

const router = Router();

// POST /api/v1/rag/index
router.post('/index', ragController.indexDocument);

// POST /api/v1/rag/query
router.post('/query', ragController.queryDocument);

// POST /api/v1/rag/clear
router.post('/clear', ragController.clearSession);

module.exports = router;

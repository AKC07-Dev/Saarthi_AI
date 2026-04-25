'use strict';

const { Router } = require('express');
const healthRoutes     = require('./healthRoutes');
const userRoutes       = require('./userRoutes');
const authRoutes       = require('./authRoutes');
const uploadRoutes     = require('./uploadRoutes');
const analyzeRoutes    = require('./analyzeRoutes');
const extractionRoutes = require('./extractionRoutes');
const formRoutes       = require('./formRoutes');
const validationRoutes = require('./validationRoutes');
const ragRoutes        = require('./ragRoutes');
const translateRoutes  = require('./translateRoutes');
const { authenticate } = require('../middleware/auth');

const router = Router();

// ─── Public routes (no auth required) ────────────────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth',   authRoutes);

// ─── Protected routes (JWT required) ─────────────────────────────────────────
router.use('/upload',   authenticate, uploadRoutes);
router.use('/analyze',  authenticate, analyzeRoutes);
router.use('/ai',       authenticate, analyzeRoutes);   // alias
router.use('/extract',  authenticate, extractionRoutes);
router.use('/form',     authenticate, formRoutes);
router.use('/autofill', authenticate, formRoutes);      // alias
router.use('/validate', authenticate, validationRoutes);
router.use('/rag',      authenticate, ragRoutes);
router.use('/translate', authenticate, translateRoutes);

// ─── User management (protected) ─────────────────────────────────────────────
router.use('/users', authenticate, userRoutes);

module.exports = router;

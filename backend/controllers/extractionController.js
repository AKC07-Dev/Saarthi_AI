'use strict';

/**
 * extractionController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/v1/extract
 *
 * Body:
 *   { "text": "<raw OCR / PDF-extracted document text>" }
 *
 * Response 200:
 *   {
 *     "success": true,
 *     "data": {
 *       "name":      "...",
 *       "dob":       "...",
 *       "address":   "...",
 *       "phone":     "...",
 *       "email":     "...",
 *       "id_number": "...",
 *       "_meta": { "chars": 0, "confidence": "5/6", "extractedAt": "..." }
 *     }
 *   }
 */

const { extractFields } = require('../services/extractionService');

/**
 * extractFromText
 * Validates the incoming request, delegates to extractionService, and returns
 * the structured field result as JSON.
 */
exports.extractFromText = (req, res, next) => {
  try {
    const { text } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain a non-empty "text" string.',
      });
    }

    // ── Extraction ──────────────────────────────────────────────────────────
    const data = extractFields(text);

    console.log(`📋 Extraction complete — confidence: ${data._meta.confidence}`);

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    console.error('❌ extractionController error:', err.message);
    next(err);
  }
};

'use strict';

/**
 * translateController.js
 *
 * POST /api/v1/translate
 * Body: { content: { summary, steps, requiredFields, warnings }, targetLang: string }
 */

const { translateAnalysis } = require('../services/translationService');

exports.translate = async (req, res, next) => {
  try {
    const { content, targetLang } = req.body;

    if (!content || typeof content !== 'object') {
      return res.status(400).json({ success: false, message: '"content" object is required.' });
    }
    if (!targetLang || typeof targetLang !== 'string') {
      return res.status(400).json({ success: false, message: '"targetLang" string is required.' });
    }

    const translated = await translateAnalysis(content, targetLang);

    return res.status(200).json({ success: true, data: translated });

  } catch (err) {
    console.error('❌ translateController error:', err.message);
    next(err);
  }
};

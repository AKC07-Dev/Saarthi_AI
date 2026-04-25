'use strict';

const { GoogleGenAI } = require('@google/genai');

/**
 * analyzeController.js
 *
 * POST /api/v1/analyze
 *
 * Uses strong prompt engineering to produce layman-language analysis.
 * Output schema (matches frontend spec exactly):
 * {
 *   summary:        string   — plain-English one-paragraph explanation
 *   steps:          string[] — ordered list of things the user must do
 *   requiredFields: string[] — data items the user needs to gather
 *   warnings:       string[] — deadlines, risks, missing info alerts
 * }
 */
exports.analyzeText = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty text string is required for analysis.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const prompt = `
You are Saarthi, an AI assistant that helps ordinary Indian citizens understand complex government documents.

Your audience is a person who may not have a college education. They speak simple Hindi/English.
Write ONLY from what is present in the document text below — do NOT invent information.

TASK: Analyze the document and respond in the EXACT JSON format shown. No markdown, no extra keys.

JSON FORMAT:
{
  "summary": "<One short paragraph (3-5 sentences) explaining what this document IS and what it MEANS for the person, in very simple everyday language. Avoid jargon.>",
  "steps": [
    "<Step 1 — First thing the person needs to do>",
    "<Step 2 — Next thing>",
    "<Continue as needed — max 6 steps>"
  ],
  "requiredFields": [
    "<Document or piece of information the person must have ready, e.g. 'Aadhaar Card', 'Passport-size photograph'>",
    "<Another required item>"
  ],
  "warnings": [
    "<Important deadline, fine, risk, or expiry date — if mentioned in the document>",
    "<Any other caution>"
  ]
}

RULES:
- If a section has nothing relevant, return an empty array [].
- Do NOT make up deadlines or steps not mentioned in the text.
- Use simple words. Explain abbreviations.
- Keep each step under 20 words.

DOCUMENT TEXT:
"""
${text.slice(0, 6000)}
"""
    `.trim();

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model:    'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsed = JSON.parse(cleaned);
    }

    // Enforce schema — never send unexpected keys to frontend
    const result = {
      summary:        String(parsed.summary        || ''),
      steps:          Array.isArray(parsed.steps)          ? parsed.steps          : [],
      requiredFields: Array.isArray(parsed.requiredFields) ? parsed.requiredFields : [],
      warnings:       Array.isArray(parsed.warnings)       ? parsed.warnings       : [],
    };

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('❌ analyzeController error:', error.message);
    next(error);
  }
};

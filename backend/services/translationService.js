'use strict';

/**
 * translationService.js
 *
 * Uses Gemini to translate AI analysis output to the target language.
 * Supports: English, Marathi, Hindi, Tamil
 */

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LANG_MAP = {
  marathi: 'Marathi (मराठी)',
  hindi:   'Hindi (हिन्दी)',
  tamil:   'Tamil (தமிழ்)',
  english: 'English',
};

/**
 * Translate an AI analysis result object into the target language.
 *
 * @param {{ summary, steps, requiredFields, warnings }} content
 * @param {string} targetLang — 'marathi' | 'hindi' | 'tamil' | 'english'
 * @returns {Promise<{ summary, steps, requiredFields, warnings }>}
 */
async function translateAnalysis(content, targetLang = 'marathi') {
  const lang = LANG_MAP[targetLang.toLowerCase()] || LANG_MAP.marathi;

  // English is already the source — return as-is
  if (targetLang.toLowerCase() === 'english') return content;

  const prompt = `
You are a professional translator for Indian government documents.
Translate the following JSON content into ${lang}.
Return ONLY valid JSON with the same structure. Do NOT change the keys.
Keep names of document types and government terms in their original form.

INPUT JSON:
${JSON.stringify(content, null, 2)}

OUTPUT (valid JSON only, no markdown):
  `.trim();

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

  return {
    summary:        String(parsed.summary        || ''),
    steps:          Array.isArray(parsed.steps)          ? parsed.steps          : [],
    requiredFields: Array.isArray(parsed.requiredFields) ? parsed.requiredFields : [],
    warnings:       Array.isArray(parsed.warnings)       ? parsed.warnings       : [],
  };
}

/**
 * Translate a plain string into the target language.
 *
 * @param {string} text
 * @param {string} targetLang
 * @returns {Promise<string>}
 */
async function translateText(text, targetLang = 'marathi') {
  const lang = LANG_MAP[targetLang.toLowerCase()] || LANG_MAP.marathi;

  if (targetLang.toLowerCase() === 'english') return text;

  const prompt = `Translate the following text into ${lang}. Return only the translated text, nothing else:\n\n${text}`;

  const response = await ai.models.generateContent({
    model:    'gemini-2.5-flash',
    contents: prompt,
  });

  return (response.text || '').trim();
}

module.exports = { translateAnalysis, translateText };

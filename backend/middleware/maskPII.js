'use strict';

/**
 * Utility function to mask Aadhaar and Phone numbers in a given string.
 * @param {string} text - The input text to mask.
 * @returns {string} - The masked text.
 */
function maskText(text) {
  if (typeof text !== 'string') return text;

  let masked = text;

  // 1. Mask Aadhaar Numbers
  // Matches 12-digit Aadhaar numbers (with or without spaces/hyphens)
  // e.g., 1234 5678 9012, 1234-5678-9012, 123456789012
  // Replaces with: XXXX-XXXX-Last4
  masked = masked.replace(/\b(?:\d{4}[\s\-]?){2}(\d{4})\b/g, 'XXXX-XXXX-$1');

  // 2. Mask Phone Numbers (Indian formats)
  // Matches 10-digit numbers starting with 6-9, optional +91 or 91 prefix
  // Replaces with: XXXXXXLast4 (preserving prefix if it exists)
  masked = masked.replace(/(?<!\d)(\+?91[\s\-]?)?([6-9]\d{5})[\s\-]?(\d{4})(?!\d)/g, (match, prefix, first6, last4) => {
    const p = prefix || '';
    return `${p}XXXXXX${last4}`;
  });

  return masked;
}

/**
 * Express middleware to recursively mask PII in the request body.
 */
const piiMiddleware = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  const traverseAndMask = (obj) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = maskText(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverseAndMask(obj[key]);
        }
      }
    }
  };

  traverseAndMask(req.body);
  next();
};

module.exports = {
  maskText,
  piiMiddleware
};

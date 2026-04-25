'use strict';

/**
 * extractionService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Regex + NLP heuristic field-extraction engine tuned for Indian documents:
 *   Aadhaar Card · PAN Card · Passport · Voter ID (EPIC) · Driving Licence
 *
 * Exported:
 *   extractFields(rawText) → { name, dob, address, phone, email, id_number, _meta }
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise line endings and collapse horizontal whitespace.
 * Preserves newlines so multi-line patterns still work.
 */
function normalise(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\S\n]+/g, ' ')  // collapse spaces/tabs but keep newlines
    .trim();
}

/**
 * Try each RegExp in sequence; return the first captured group (or full match),
 * trimmed, or '' if nothing matches.
 */
function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) {
      const hit = (m[1] ?? m[0]).trim();
      if (hit) return hit;
    }
  }
  return '';
}

// ─── Individual Field Extractors ──────────────────────────────────────────────

/**
 * Extract the person's full name.
 * Strategy (priority order):
 *  1. Label-anchored: "Name:", "Full Name:", "Applicant Name:" …
 *  2. PAN card pattern – name on its own line after "Name" label
 *  3. S/O D/O W/O C/O salutation prefix
 *  4. Letter salutation "Dear Mr./Ms. …"
 *  5. All-caps 2–4 word line (common in Aadhaar / govt forms)
 */
function extractName(text) {
  return firstMatch(text, [
    // 1. Generic labelled — stops at newline/digit to avoid bleeding into next field
    /(?:Full\s+Name|Name\s+of\s+Applicant|Applicant\s+Name|Holder'?s?\s+Name|Name)\s*[:/]\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,4})(?=\s*[\n\d,]|$)/im,

    // 2. PAN / Aadhaar – name follows "Name" on the NEXT line
    /(?:^|\n)\s*Name\s*\n\s*([A-Z][A-Z\s]{3,40})/,

    // 3. Relational suffix before name line
    /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})\s*(?:S\/O|D\/O|W\/O|C\/O)/m,

    // 4. Salutation in letters
    /Dear\s+(?:Mr\.?|Ms\.?|Mrs\.?|Dr\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s*,/i,

    // 5. All-caps short line (Aadhaar front)
    /^([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})$/m,
  ]);
}

/**
 * Extract date of birth.
 * Handles: DD/MM/YYYY · DD-MM-YYYY · DD.MM.YYYY · YYYY-MM-DD
 *          "15 Jan 1990" · "January 15, 1990" · "Year of Birth: 1990"
 */
function extractDOB(text) {
  // Use literal regex for each date format to avoid character-class escaping issues
  return firstMatch(text, [
    // DD/MM/YYYY  DD-MM-YYYY  DD.MM.YYYY
    /(?:Date\s+of\s+Birth|D\.?O\.?B\.?|Birth\s+Date|Born\s+on)\s*[:\/.-]?\s*(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/i,
    // YYYY/MM/DD  YYYY-MM-DD
    /(?:Date\s+of\s+Birth|D\.?O\.?B\.?|Birth\s+Date|Born\s+on)\s*[:\/.-]?\s*(\d{4}[.\/-]\d{1,2}[.\/-]\d{1,2})/i,
    // 15 Jan 1990
    /(?:Date\s+of\s+Birth|D\.?O\.?B\.?|Birth\s+Date|Born\s+on)\s*[:\/.-]?\s*(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{2,4})/i,
    // January 15, 1990
    /(?:Date\s+of\s+Birth|D\.?O\.?B\.?|Birth\s+Date|Born\s+on)\s*[:\/.-]?\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{1,2},?\s*\d{4})/i,
    // Year of Birth: 1990
    /Year\s+of\s+Birth\s*[:/]?\s*(\d{4})/i,
  ]);
}

/**
 * Extract postal address.
 * Strategy:
 *  1. Label-anchored block up to the next blank line or labelled field
 *  2. Line containing "Pin Code" keyword + 6-digit number
 *  3. Nearest 3 preceding lines to any 6-digit PIN code
 */
function extractAddress(text) {
  // 1. Labelled block
  const labelRe = /(?:Permanent\s+Address|Residential\s+Address|Correspondence\s+Address|Address)\s*[:/]\s*([\s\S]{10,400}?)(?=\n\s*\n|\n\s*[A-Z][a-z]+\s*[:/]|$)/i;
  const lm = text.match(labelRe);
  if (lm && lm[1]) {
    const addr = lm[1].replace(/\s+/g, ' ').trim();
    if (addr.length > 10) return addr;
  }

  // 2. "Pin Code : 400001" keyword line
  const pinKeyRe = /([^\n]{0,250}(?:Pin(?:\s*Code)?|PIN)\s*[:/]?\s*\d{6}[^\n]{0,100})/i;
  const pkm = text.match(pinKeyRe);
  if (pkm) return pkm[1].replace(/\s+/g, ' ').trim();

  // 3. Context around a bare 6-digit number
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/\b[1-9]\d{5}\b/.test(lines[i])) {
      const start = Math.max(0, i - 3);
      return lines.slice(start, i + 1).join(', ').replace(/\s+/g, ' ').trim();
    }
  }

  return '';
}

/**
 * Extract Indian mobile / phone number.
 * Handles: +91-XXXXXXXXXX · 91 XXXXX XXXXX · 10-digit starting 6–9
 */
function extractPhone(text) {
  return firstMatch(text, [
    // Labelled with country code
    /(?:Mobile|Phone|Contact|Tel(?:ephone)?|Cell|Mob\.?)\s*(?:No\.?|Number|#)?\s*[:/]?\s*(\+91[\s\-]?[6-9]\d{4}[\s\-]?\d{5})/i,
    // Labelled without country code
    /(?:Mobile|Phone|Contact|Tel(?:ephone)?|Cell|Mob\.?)\s*(?:No\.?|Number|#)?\s*[:/]?\s*([6-9]\d{9})/i,
    // Standalone +91 variations
    /(\+91[\s\-]?[6-9]\d{4}[\s\-]?\d{5})/,
    /(?<!\d)(91[\s\-][6-9]\d{4}[\s\-]?\d{5})(?!\d)/,
    // Bare 10-digit
    /(?<!\d)([6-9]\d{9})(?!\d)/,
  ]);
}

/**
 * Extract email address (labelled first, then standalone).
 */
function extractEmail(text) {
  return firstMatch(text, [
    /(?:E[\s\-]?Mail|Email)\s*(?:ID|Address|Id)?\s*[:/]?\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
    /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/,
  ]);
}

/**
 * Extract the most prominent Indian ID number.
 * Priority: Aadhaar → PAN → Passport → Voter ID → Driving Licence
 */
function extractIdNumber(text) {
  const groups = [
    {
      type: 'aadhaar',
      patterns: [
        /(?:Aadhaar|Aadhar|UID|UIDAI)\s*(?:No\.?|Number|#)?\s*[:/]?\s*([0-9X]{4}\s[0-9X]{4}\s\d{4})/i,
        /(?:Aadhaar|Aadhar|UID|UIDAI)\s*(?:No\.?|Number|#)?\s*[:/]?\s*([0-9X]{12})/i,
        /\b([2-9]\d{3}\s\d{4}\s\d{4})\b/,  // unmasked 12-digit
      ],
    },
    {
      type: 'pan',
      patterns: [
        /(?:PAN|Permanent\s+Account\s+Number)\s*(?:No\.?|Number|#)?\s*[:/]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i,
        /\b([A-Z]{5}[0-9]{4}[A-Z])\b/,
      ],
    },
    {
      type: 'passport',
      patterns: [
        /(?:Passport)\s*(?:No\.?|Number|#)?\s*[:/]?\s*([A-PR-WY-Z][0-9]{7})/i,
        /\b([A-PR-WY-Z][0-9]{7})\b/,
      ],
    },
    {
      type: 'voter_id',
      patterns: [
        /(?:Voter\s+(?:ID|Card)|EPIC|Election\s+Card)\s*(?:No\.?|Number|#)?\s*[:/]?\s*([A-Z]{3}[0-9]{7})/i,
        /\b([A-Z]{3}[0-9]{7})\b/,
      ],
    },
    {
      type: 'dl',
      patterns: [
        /(?:DL|Driving\s+Licen[cs]e?|Licence)\s*(?:No\.?|Number|#)?\s*[:/]?\s*([A-Z]{2}[0-9]{2}\s?[0-9]{4}\s?[0-9]{7})/i,
        /\b([A-Z]{2}[0-9]{13})\b/,
      ],
    },
  ];

  for (const { patterns } of groups) {
    const hit = firstMatch(text, patterns);
    if (hit) return hit;
  }
  return '';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract structured fields from raw document text.
 *
 * @param {string} rawText  OCR / PDF-extracted text of an Indian document.
 * @returns {{
 *   name:      string,
 *   dob:       string,
 *   address:   string,
 *   phone:     string,
 *   email:     string,
 *   id_number: string,
 *   _meta: { chars: number, confidence: string, extractedAt: string }
 * }}
 */
function extractFields(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new TypeError('extractFields: rawText must be a non-empty string.');
  }

  const text = normalise(rawText);

  const fields = {
    name:      extractName(text),
    dob:       extractDOB(text),
    address:   extractAddress(text),
    phone:     extractPhone(text),
    email:     extractEmail(text),
    id_number: extractIdNumber(text),
  };

  // Confidence: how many of the 6 core fields were successfully extracted
  const CORE = ['name', 'dob', 'address', 'phone', 'email', 'id_number'];
  const found = CORE.filter(f => fields[f] !== '').length;

  return {
    ...fields,
    _meta: {
      chars:       text.length,
      confidence:  `${found}/${CORE.length}`,
      extractedAt: new Date().toISOString(),
    },
  };
}

module.exports = { extractFields };

'use strict';

/**
 * autofillController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/v1/autofill
 *
 * Request body:
 * {
 *   "extractedFields": {
 *     "name":      "Priya Sharma",
 *     "dob":       "22/03/1995",
 *     "address":   "Flat 4B, Pune, 411001",
 *     "phone":     "9876543210",
 *     "email":     "priya@gmail.com",
 *     "id_number": "2345 6789 1234"
 *   },
 *   "formSchema": [
 *     { "id": "full_name",    "label": "Full Name",        "required": true  },
 *     { "id": "dob",          "label": "Date of Birth",    "required": true  },
 *     { "id": "mobile",       "label": "Mobile Number",    "required": true  },
 *     { "id": "email_id",     "label": "Email ID",         "required": false },
 *     { "id": "aadhar_no",    "label": "Aadhaar Number",   "required": true  },
 *     { "id": "home_address", "label": "Home Address",     "required": false }
 *   ]
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "filledForm":    { "full_name": "Priya Sharma", … },
 *     "missingFields": [],
 *     "mappingTrace":  { "full_name": "name", … },
 *     "_meta":         { "totalFields": 6, "filled": 6, "completionPct": "100%" }
 *   }
 * }
 */

const { autofillForm } = require('../services/autofillService');

exports.autofill = (req, res, next) => {
  try {
    const { extractedFields, formSchema } = req.body;

    // ── Validate ─────────────────────────────────────────────────────────────
    if (!extractedFields || typeof extractedFields !== 'object') {
      return res.status(400).json({
        success: false,
        message: '"extractedFields" must be a non-null object.',
      });
    }

    if (!formSchema) {
      return res.status(400).json({
        success: false,
        message: '"formSchema" is required (array of field descriptors or { fields: [...] }).',
      });
    }

    // ── Process ───────────────────────────────────────────────────────────────
    const data = autofillForm({ extractedFields, formSchema });

    console.log(
      `✅ Autofill complete — ${data._meta.filled}/${data._meta.totalFields} ` +
      `fields filled (${data._meta.completionPct})`
    );

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('❌ autofillController error:', err.message);
    next(err);
  }
};

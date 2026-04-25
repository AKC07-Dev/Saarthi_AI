'use strict';

/**
 * autofillService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps extracted document fields → an arbitrary form schema.
 *
 * Algorithm:
 *   1. Normalise each form-field identifier (id + label).
 *   2. Look it up in the ALIAS_MAP → canonical key (name / dob / address …).
 *   3. If no alias hit, try fuzzy token overlap scoring against each canonical key.
 *   4. Assemble filledForm and missingFields from required fields that stayed empty.
 *
 * Exported:
 *   autofillForm({ extractedFields, formSchema }) → { filledForm, missingFields, _meta }
 */

// ─── Canonical Key Alias Dictionary ──────────────────────────────────────────
//
// Every string here is lowercased & stripped of spaces/underscores at match time.
// Add more aliases freely — the engine is data-driven.
//
const ALIAS_MAP = {
  name: [
    'name', 'fullname', 'full_name', 'applicantname', 'holdername',
    'customername', 'username', 'membername', 'clientname',
    'firstname', 'lastname', 'surname', 'givenname', 'candidatename',
    'employeename', 'studentname', 'patientname', 'ownername',
    'nameonapplicant', 'nameofapplicant', 'nameofholder',
  ],
  dob: [
    'dob', 'dateofbirth', 'birthdate', 'date_of_birth', 'born',
    'bornondate', 'birthyear', 'yearofbirth', 'dateofborn',
    'birthday', 'dateofbirth', 'd_o_b',
  ],
  address: [
    'address', 'fulladdress', 'residentialaddress', 'permanentaddress',
    'correspondenceaddress', 'currentaddress', 'homeaddress',
    'mailingaddress', 'postaladdress', 'streetaddress', 'location',
    'addr', 'res_address', 'perm_address',
  ],
  phone: [
    'phone', 'phonenumber', 'mobile', 'mobilenumber', 'cell',
    'cellphone', 'contactnumber', 'contact', 'telephone', 'tel',
    'mob', 'mobnumber', 'phoneno', 'mobileno', 'contactno',
    'primaryphone', 'alternateno', 'whatsapp', 'reachableat',
  ],
  email: [
    'email', 'emailaddress', 'emailid', 'mail', 'mailid',
    'electronicmail', 'emailaddress', 'emailcontact', 'emailid',
    'e_mail', 'emailaddr',
  ],
  id_number: [
    'idnumber', 'id', 'idno', 'identificationnumber', 'documentnumber',
    'aadhaar', 'aadhaarnumber', 'aadhaarno', 'uid', 'uidno',
    'pan', 'pannumber', 'panno', 'permanentaccountnumber',
    'passport', 'passportno', 'passportnumber',
    'voterid', 'epicno', 'epicnumber', 'electioncardno',
    'drivinglicence', 'dl', 'dlno', 'licensenumber',
    'govtid', 'nationalid', 'taxid',
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip spaces, underscores, hyphens; lowercase. */
function tokenise(str) {
  return String(str)
    .toLowerCase()
    .replace(/[\s_\-\.]/g, '');
}

/**
 * Build a reverse lookup: normalisedAlias → canonicalKey
 * Called once at module load.
 */
function buildReverseMap() {
  const map = new Map();
  for (const [canonical, aliases] of Object.entries(ALIAS_MAP)) {
    for (const alias of aliases) {
      map.set(tokenise(alias), canonical);
    }
  }
  return map;
}

const REVERSE_MAP = buildReverseMap();

/**
 * Fuzzy scorer: count how many tokens from `needle` appear inside `haystack`.
 * Returns a 0–1 score.
 */
function fuzzyScore(needle, haystack) {
  const nTokens = needle.match(/[a-z]+/g) || [];
  const hStr = haystack.toLowerCase();
  const hits = nTokens.filter(t => t.length > 2 && hStr.includes(t));
  return nTokens.length ? hits.length / nTokens.length : 0;
}

/**
 * Resolve a form field (id + label) to one of our canonical keys, or null.
 *
 * Priority:
 *   1. Exact alias match on tokenised(id)
 *   2. Exact alias match on tokenised(label)
 *   3. Best fuzzy match (score ≥ 0.5) over canonical keys
 */
function resolveCanonical(fieldId, fieldLabel = '') {
  const idKey = tokenise(fieldId);
  const labelKey = tokenise(fieldLabel);

  // 1. Exact alias hit on id
  if (REVERSE_MAP.has(idKey)) return REVERSE_MAP.get(idKey);

  // 2. Exact alias hit on label
  if (REVERSE_MAP.has(labelKey)) return REVERSE_MAP.get(labelKey);

  // 3. Fuzzy: score each canonical key's aliases against id + label
  const combined = `${fieldId} ${fieldLabel}`.toLowerCase();
  let bestKey = null;
  let bestScore = 0;

  for (const canonical of Object.keys(ALIAS_MAP)) {
    const score = fuzzyScore(combined, canonical) +
      fuzzyScore(combined, ALIAS_MAP[canonical].join(' '));
    if (score > bestScore) {
      bestScore = score;
      bestKey = canonical;
    }
  }

  return bestScore >= 0.5 ? bestKey : null;
}

// ─── Core Function ────────────────────────────────────────────────────────────

/**
 * Autofill a form from extracted document fields.
 *
 * @param {object} params
 * @param {object} params.extractedFields
 *   The output of extractionService.extractFields(), e.g.:
 *   { name, dob, address, phone, email, id_number }
 *
 * @param {object} params.formSchema
 *   Describes the target form.  Two supported shapes:
 *
 *   Shape A — array of field descriptors:
 *     [ { id: "full_name", label: "Full Name", required: true }, … ]
 *
 *   Shape B — object with a "fields" key:
 *     { formName: "KYC Form", fields: [ … ] }
 *
 * @returns {{
 *   filledForm:    object,          // id → value map
 *   missingFields: string[],        // ids of required fields that stayed empty
 *   mappingTrace:  object,          // id → canonical key (for debugging)
 *   _meta: { totalFields, filled, missing, completionPct }
 * }}
 */
function autofillForm({ extractedFields, formSchema }) {
  // ── Validate inputs ────────────────────────────────────────────────────────
  if (!extractedFields || typeof extractedFields !== 'object') {
    throw new TypeError('autofillForm: extractedFields must be an object.');
  }
  if (!formSchema) {
    throw new TypeError('autofillForm: formSchema is required.');
  }

  // Normalise schema to array of field descriptors
  const schemaFields = Array.isArray(formSchema)
    ? formSchema
    : Array.isArray(formSchema.fields)
      ? formSchema.fields
      : null;

  if (!schemaFields || schemaFields.length === 0) {
    throw new TypeError(
      'autofillForm: formSchema must be an array or { fields: [...] }.'
    );
  }

  // Strip _meta from extracted fields before mapping
  const { _meta: _ignored, ...docFields } = extractedFields;

  const filledForm = {};
  const missingFields = [];
  const mappingTrace = {};

  // ── Map each form field ────────────────────────────────────────────────────
  for (const field of schemaFields) {
    const id = String(field.id ?? field.name ?? '').trim();
    const label = String(field.label ?? field.title ?? '').trim();
    const required = field.required === true;

    if (!id) continue;  // skip malformed field descriptors

    // Resolve to canonical key
    const canonical = resolveCanonical(id, label);
    mappingTrace[id] = canonical ?? '(no match)';

    // Look up value from docFields
    const value = canonical ? (docFields[canonical] ?? '') : '';

    filledForm[id] = value;

    if (required && !value) {
      missingFields.push(id);
    }
  }

  // ── Build meta ─────────────────────────────────────────────────────────────
  const totalFields = schemaFields.length;
  const filledCount = Object.values(filledForm).filter(v => v !== '').length;
  const completionPct = totalFields
    ? Math.round((filledCount / totalFields) * 100)
    : 0;

  return {
    filledForm,
    missingFields,
    mappingTrace,
    _meta: {
      totalFields,
      filled: filledCount,
      missing: missingFields.length,
      completionPct: `${completionPct}%`,
    },
  };
}

module.exports = { autofillForm };

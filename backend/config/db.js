'use strict';

/**
 * db.js — JSON file-based persistence layer.
 * Replaces MongoDB so no external DB is needed.
 * Each collection is stored as a flat JSON array in /data/<name>.json
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Read all records from a collection file.
 * @param {string} name  collection name (e.g. 'users')
 * @returns {Array}
 */
function readCollection(name) {
  ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Write records back to a collection file (atomic-ish via sync write).
 * @param {string} name
 * @param {Array}  data
 */
function writeCollection(name, data) {
  ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Get the next auto-increment ID for a collection.
 * @param {Array} records
 * @returns {number}
 */
function nextId(records) {
  if (!records.length) return 1;
  return Math.max(...records.map((r) => r.id || 0)) + 1;
}

module.exports = { readCollection, writeCollection, nextId };

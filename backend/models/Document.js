'use strict';

/**
 * Document model — JSON file backed.
 * Collection: data/documents.json
 *
 * Schema:
 *   id, userId, fileName, mimeType, textLength, extractedText,
 *   extractedFields, uploadedAt
 */

const { readCollection, writeCollection, nextId } = require('../config/db');

const COL = 'documents';

const DocumentModel = {
  findAll() {
    return readCollection(COL);
  },

  findById(id) {
    return readCollection(COL).find((d) => d.id === id) || null;
  },

  findByUser(userId) {
    return readCollection(COL).filter((d) => d.userId === userId);
  },

  /**
   * Save a newly uploaded document's metadata.
   * @param {{ userId?, fileName, mimeType, textLength, extractedText }} data
   * @returns {object}
   */
  create(data) {
    const docs = readCollection(COL);
    const doc  = {
      id:              nextId(docs),
      userId:          data.userId || null,
      fileName:        data.fileName,
      mimeType:        data.mimeType || '',
      textLength:      data.textLength || 0,
      extractedText:   data.extractedText || '',
      extractedFields: data.extractedFields || null,
      uploadedAt:      new Date().toISOString(),
    };
    docs.push(doc);
    writeCollection(COL, docs);
    return doc;
  },

  /** Update fields (e.g. attach extractedFields after extraction). */
  update(id, updates) {
    const docs = readCollection(COL);
    const idx  = docs.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    docs[idx] = { ...docs[idx], ...updates };
    writeCollection(COL, docs);
    return docs[idx];
  },
};

module.exports = DocumentModel;

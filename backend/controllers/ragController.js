'use strict';

/**
 * ragController.js
 *
 * POST /api/v1/rag/index  — Index a document text into the RAG vector store
 * POST /api/v1/rag/query  — Query the indexed document with a natural language question
 */

const ragService = require('../services/ragService');

/**
 * POST /api/v1/rag/index
 * Body: { sessionId: string, text: string }
 */
exports.indexDocument = async (req, res, next) => {
  try {
    const { sessionId, text } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ success: false, message: '"sessionId" is required.' });
    }
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({ success: false, message: '"text" must be a non-empty string (min 20 chars).' });
    }

    const result = await ragService.indexDocument(sessionId, text);

    return res.status(200).json({
      success: true,
      message: `Document indexed. ${result.chunks} chunks stored.`,
      data:    result,
    });

  } catch (err) {
    console.error('❌ RAG index error:', err.message);
    next(err);
  }
};

/**
 * POST /api/v1/rag/query
 * Body: { sessionId: string, query: string }
 */
exports.queryDocument = async (req, res, next) => {
  try {
    const { sessionId, query } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ success: false, message: '"sessionId" is required.' });
    }
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ success: false, message: '"query" is required.' });
    }

    const result = await ragService.queryDocument(sessionId, query.trim());

    return res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error('❌ RAG query error:', err.message);
    next(err);
  }
};

/**
 * POST /api/v1/rag/clear
 * Body: { sessionId: string }
 */
exports.clearSession = (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) ragService.clearSession(sessionId);
  return res.status(200).json({ success: true, message: 'Session cleared.' });
};

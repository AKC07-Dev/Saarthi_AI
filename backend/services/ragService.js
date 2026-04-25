'use strict';

/**
 * ragService.js — Real RAG (Retrieval-Augmented Generation) pipeline.
 *
 * Uses Gemini text-embedding-004 for embeddings and cosine similarity
 * for retrieval. No external vector DB required.
 *
 * Flow:
 *  1. indexDocument(sessionId, text)  — chunk → embed → store in memory
 *  2. queryDocument(sessionId, query) — embed query → cosine sim → top-k → Gemini
 */

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── In-Memory Vector Store ───────────────────────────────────────────────────
// Map<sessionId, Array<{ text: string, embedding: number[] }>>
const vectorStore = new Map();

// ─── Constants ────────────────────────────────────────────────────────────────
const CHUNK_SIZE    = 400;   // chars per chunk
const CHUNK_OVERLAP = 80;    // overlap between chunks
const TOP_K         = 4;     // chunks to retrieve per query
const EMBED_MODEL   = 'text-embedding-004';
const CHAT_MODEL    = 'gemini-2.5-flash';

// ─── Chunking ─────────────────────────────────────────────────────────────────

/**
 * Split text into overlapping chunks.
 * @param {string} text
 * @returns {string[]}
 */
function chunkText(text) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks.filter((c) => c.length > 20);
}

// ─── Embedding ────────────────────────────────────────────────────────────────

/**
 * Get embedding vector for a text string.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function embed(text) {
  const response = await ai.models.embedContent({
    model:   EMBED_MODEL,
    contents: text,
  });
  return response.embeddings[0].values;
}

// ─── Cosine Similarity ────────────────────────────────────────────────────────

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Index a document for a session.
 * Chunks the text, generates embeddings, stores in memory.
 *
 * @param {string} sessionId  — unique per upload (use fileName+timestamp)
 * @param {string} text       — full document text
 * @returns {{ chunks: number }}
 */
async function indexDocument(sessionId, text) {
  if (!text || typeof text !== 'string') {
    throw new TypeError('indexDocument: text must be a non-empty string');
  }

  const chunks = chunkText(text);
  console.log(`📚 RAG: Indexing ${chunks.length} chunks for session "${sessionId}"…`);

  const indexed = [];
  for (const chunk of chunks) {
    const embedding = await embed(chunk);
    indexed.push({ text: chunk, embedding });
  }

  vectorStore.set(sessionId, indexed);
  console.log(`✅ RAG: Indexed ${indexed.length} chunks.`);

  return { chunks: indexed.length };
}

/**
 * Query the indexed document.
 * Retrieves top-K relevant chunks and sends them to Gemini with the query.
 *
 * @param {string} sessionId
 * @param {string} query     — user's natural language question
 * @returns {{ answer: string, sources: string[] }}
 */
async function queryDocument(sessionId, query) {
  const store = vectorStore.get(sessionId);

  if (!store || store.length === 0) {
    return {
      answer:  'No document has been indexed for this session. Please upload a document first.',
      sources: [],
    };
  }

  // Embed the query
  const queryEmbedding = await embed(query);

  // Rank chunks by cosine similarity
  const ranked = store
    .map((item) => ({ ...item, score: cosine(queryEmbedding, item.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  const context = ranked.map((r, i) => `[Chunk ${i + 1}]\n${r.text}`).join('\n\n');

  const prompt = `
You are Saarthi, an AI assistant helping Indian citizens understand their government documents.
Answer the user's question based ONLY on the document excerpts provided below.
If the answer is not in the excerpts, say "This information is not mentioned in your document."
Keep your answer clear and simple — as if explaining to a first-time user.

DOCUMENT EXCERPTS:
${context}

USER'S QUESTION: ${query}

Answer:`.trim();

  const response = await ai.models.generateContent({
    model:    CHAT_MODEL,
    contents: prompt,
  });

  return {
    answer:  response.text.trim(),
    sources: ranked.map((r) => r.text.slice(0, 120) + '…'),
  };
}

/**
 * Clear the vector store for a session (call when user uploads a new document).
 * @param {string} sessionId
 */
function clearSession(sessionId) {
  vectorStore.delete(sessionId);
}

module.exports = { indexDocument, queryDocument, clearSession };

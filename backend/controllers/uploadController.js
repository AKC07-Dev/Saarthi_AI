'use strict';

/**
 * uploadController.js
 * Handles file uploads, text extraction, and OCR fallback.
 *
 * Flow:
 *   PDF  → pdf-parse  → if text < 50 chars → pdf-poppler → tesseract OCR
 *   Image               → tesseract OCR directly
 */

const fs   = require('fs');
const path = require('path');

// pdf-parse: handle both default and named export (CommonJS compat)
const pdfParseLib = require('pdf-parse');
const pdfParse    = (typeof pdfParseLib === 'function') ? pdfParseLib : pdfParseLib.default;

const { convertPdfToImages } = require('../utils/pdfUtils');
const { runOCR }             = require('../services/ocrService');

// Minimum character threshold to consider pdf-parse output as "real" text
const MIN_TEXT_LENGTH = 50;

/**
 * Safely delete a file, swallowing errors (file may already be gone).
 * @param {string} filePath
 */
function safeDelete(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted temp file: ${filePath}`);
    }
  } catch (err) {
    console.warn(`⚠️  Could not delete "${filePath}": ${err.message}`);
  }
}

/**
 * POST /api/v1/upload
 * Accepts a single file (PDF or image) and returns extracted text.
 */
const processUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const fileType = req.file.mimetype;
  const fileName = req.file.originalname || path.basename(filePath);

  // Track all temp files so we can clean them up in finally{}
  const tempFiles = [filePath];

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📥 Upload received: "${fileName}"`);
  console.log(`   MIME type : ${fileType}`);
  console.log(`   Temp path : ${filePath}`);

  let extractedText = '';

  try {
    // ── PDF branch ─────────────────────────────────────────────────────────────
    if (fileType === 'application/pdf') {
      console.log('\n📘 Processing as PDF...');

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData    = await pdfParse(dataBuffer);
      extractedText    = (pdfData.text || '').trim();

      console.log(`   pdf-parse extracted: ${extractedText.length} chars`);

      if (extractedText.length < MIN_TEXT_LENGTH) {
        console.log(`\n⚠️  Text below threshold (${MIN_TEXT_LENGTH} chars) → falling back to OCR`);

        // Convert PDF pages to images
        const imagePaths = await convertPdfToImages(filePath);

        // Register generated images for cleanup
        tempFiles.push(...imagePaths);

        // Run OCR on images — ocrService validates they are not PDFs
        extractedText = await runOCR(imagePaths);
      }
    }

    // ── Image branch ───────────────────────────────────────────────────────────
    else if (
      fileType === 'image/png'  ||
      fileType === 'image/jpeg' ||
      fileType === 'image/jpg'  ||
      fileType === 'image/bmp'  ||
      fileType === 'image/tiff' ||
      fileType === 'image/webp'
    ) {
      console.log('\n🖼️  Processing as image → Running OCR...');
      extractedText = await runOCR([filePath]);
    }

    // ── Unsupported type ───────────────────────────────────────────────────────
    else {
      return res.status(415).json({
        success : false,
        message : `Unsupported file type: ${fileType}`,
      });
    }

    // ── Normalise whitespace ───────────────────────────────────────────────────
    extractedText = extractedText.replace(/\s+/g, ' ').trim();

    console.log(`\n✅ Final extracted text length: ${extractedText.length} chars`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return res.status(200).json({
      success       : true,
      fileName,
      textLength    : extractedText.length,
      extractedText,
    });

  } catch (error) {
    console.error('\n❌ Upload processing error:', error.message);
    console.error(error.stack);

    return res.status(500).json({
      success : false,
      message : 'Document processing failed.',
      error   : process.env.NODE_ENV === 'development' ? error.message : undefined,
    });

  } finally {
    // Always clean up every temp file, even on error
    for (const f of tempFiles) {
      safeDelete(f);
    }
  }
};

module.exports = { processUpload };
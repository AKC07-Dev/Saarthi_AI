'use strict';

/**
 * ocrService.js
 * Runs Tesseract OCR on an array of image paths.
 * NEVER pass a PDF path here — only PNG/JPEG images.
 * Uses Tesseract.js v7 createWorker API.
 */

const { createWorker } = require('tesseract.js');
const path = require('path');

// Allowed image extensions — guard against accidental PDF passthrough
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp']);

/**
 * Run OCR on one or more image files.
 * @param {string[]} imagePaths  Array of absolute paths to image files.
 * @returns {Promise<string>}    Combined extracted text from all pages.
 */
async function runOCR(imagePaths) {
  if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
    throw new Error('runOCR: imagePaths must be a non-empty array');
  }

  // Safety check — reject PDFs or unknown types
  for (const imgPath of imagePaths) {
    const ext = path.extname(imgPath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      throw new Error(
        `runOCR: received a non-image file "${path.basename(imgPath)}" (ext: "${ext}"). ` +
        'Convert PDF to images first via convertPdfToImages().'
      );
    }
  }

  console.log(`\n🔍 OCR: Starting on ${imagePaths.length} image(s)...`);

  // Create a single reusable worker for all pages
  const worker = await createWorker('eng', 1, {
    // Point tesseract at the trained data bundled with tesseract.js
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const pct = (m.progress * 100).toFixed(0);
        process.stdout.write(`\r   ⏳ OCR progress: ${pct}%   `);
      }
    },
  });

  let combinedText = '';

  for (let i = 0; i < imagePaths.length; i++) {
    const imgPath = imagePaths[i];
    console.log(`\n   📸 OCR page ${i + 1}/${imagePaths.length}: ${imgPath}`);

    const { data: { text } } = await worker.recognize(imgPath);
    combinedText += text + '\n';
    console.log(`   ✅ Page ${i + 1} extracted ${text.trim().length} chars`);
  }

  await worker.terminate();
  console.log('\n🎉 OCR complete.\n');

  return combinedText;
}

module.exports = { runOCR };
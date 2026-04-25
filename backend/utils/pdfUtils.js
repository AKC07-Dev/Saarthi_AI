'use strict';

/**
 * pdfUtils.js
 * Converts a PDF into PNG images using pdf-poppler (Poppler on Windows).
 * Returns a sorted array of absolute image paths ready for OCR.
 */

const pdf  = require('pdf-poppler');
const path = require('path');
const fs   = require('fs');

// ─── Poppler Binary Path (Windows) ────────────────────────────────────────────
// pdf-poppler tries these in order until one works.
// Add or reorder to match your Poppler installation.
const POPPLER_CANDIDATES = [
  'C:\\poppler\\Library\\bin',                                          // recommended (manual install)
  'C:\\Program Files\\poppler\\Library\\bin',
  'C:\\Program Files (x86)\\poppler\\Library\\bin',
  'C:\\tools\\poppler\\Library\\bin',                                   // Chocolatey
  'C:\\Program Files\\Release-25.12.0-0\\poppler-25.12.0\\Library\\bin', // winget build
  'C:\\poppler\\bin',
];

/**
 * Find the first Poppler bin path that actually exists on disk.
 * Falls back to null (let pdf-poppler rely on system PATH).
 */
function resolvePopplerPath() {
  for (const candidate of POPPLER_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      console.log(`✅ pdfUtils: Using Poppler at: ${candidate}`);
      return candidate;
    }
  }
  console.warn(
    '⚠️  pdfUtils: No Poppler binary found in known paths. ' +
    'Falling back to system PATH. Add your path to POPPLER_CANDIDATES if conversion fails.'
  );
  return null; // pdf-poppler will rely on PATH
}

const POPPLER_BIN = resolvePopplerPath();

/**
 * Convert every page of a PDF into a PNG image.
 * @param  {string}   pdfPath  Absolute path to the input PDF.
 * @returns {Promise<string[]>} Sorted list of absolute image paths.
 */
const convertPdfToImages = async (pdfPath) => {
  // Sanity-check: only accept .pdf files
  const ext = path.extname(pdfPath).toLowerCase();
  if (ext !== '.pdf') {
    throw new Error(`convertPdfToImages: expected a .pdf file, got "${ext}"`);
  }
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`convertPdfToImages: PDF file not found at "${pdfPath}"`);
  }

  const outputDir    = path.dirname(pdfPath);
  const outputPrefix = path.basename(pdfPath, ext); // filename without extension

  const opts = {
    format      : 'png',
    out_dir     : outputDir,
    out_prefix  : outputPrefix,
    page        : null,         // null = all pages
  };

  // Only set poppler_path if we found one — omitting lets pdf-poppler use PATH
  if (POPPLER_BIN) {
    opts.poppler_path = POPPLER_BIN;
  }

  console.log(`\n📄 pdfUtils: Converting "${path.basename(pdfPath)}" → images`);
  console.log(`   Output dir   : ${outputDir}`);
  console.log(`   Output prefix: ${outputPrefix}`);
  console.log(`   Poppler path : ${POPPLER_BIN || '(system PATH)'}`);

  await pdf.convert(pdfPath, opts);

  // Collect generated PNG images that match our prefix
  const allFiles   = fs.readdirSync(outputDir);
  const imagePaths = allFiles
    .filter(f => f.startsWith(outputPrefix) && f.endsWith('.png'))
    .sort()
    .map(f  => path.join(outputDir, f));

  console.log(`✅ pdfUtils: Generated ${imagePaths.length} image(s):`, imagePaths);

  if (imagePaths.length === 0) {
    throw new Error(
      'pdfUtils: No images were generated. ' +
      'Verify that the Poppler binary path is correct and the PDF is not corrupt.\n' +
      'Known paths tried:\n  ' + POPPLER_CANDIDATES.join('\n  ')
    );
  }

  return imagePaths;
};

module.exports = { convertPdfToImages };
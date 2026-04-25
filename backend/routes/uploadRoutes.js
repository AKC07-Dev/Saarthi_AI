'use strict';

const { Router } = require('express');
const multer = require('multer');
const os = require('os');
const { processUpload } = require('../controllers/uploadController');

const router = Router();

const upload = multer({ 
  dest: os.tmpdir(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file'), false);
    }
  }
});

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid file' });
    }
    next();
  });
}, processUpload);

module.exports = router;

/**
 * uploadMiddleware.js — File upload handling
 *
 * WHY: Multer configuration lives here and NOWHERE else.
 * This middleware is responsible for exactly three things:
 *   1. Accepting only PDF files (MIME + extension check)
 *   2. Enforcing a 10 MB size limit
 *   3. Writing the file to disk in the uploads/ directory
 *
 * Any validation that is not file-related belongs elsewhere.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve uploads directory relative to the project root (one level up from middleware/)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists at startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Multer storage config.
 * Saves files with a timestamp-prefixed name to avoid collisions.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName  = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  },
});

/**
 * Filter: reject any file that is not a PDF.
 * Checks both the MIME type AND the file extension for defence-in-depth.
 */
function fileFilter(_req, file, cb) {
  const isMimePDF      = file.mimetype === 'application/pdf';
  const isExtensionPDF = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isMimePDF && isExtensionPDF) {
    cb(null, true);
  } else {
    // Passing an Error to cb rejects the file and triggers the error handler
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF files are accepted.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

/**
 * uploadMiddleware — Express middleware that handles a single 'resume' field.
 *
 * Wraps multer's .single() in a custom handler so we can produce
 * consistent error messages instead of multer's default error format.
 */
function uploadMiddleware(req, res, next) {
  const multerHandler = upload.single('resume');

  multerHandler(req, res, (err) => {
    if (!err) return next();

    // Translate multer errors into readable messages
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File is too large. Maximum allowed size is 10 MB.',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(415).json({
          success: false,
          message: 'Invalid file type. Only PDF files are accepted.',
        });
      }
    }

    // Unknown multer error — pass to global error handler
    next(err);
  });
}

export default uploadMiddleware;

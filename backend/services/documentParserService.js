/**
 * documentParserService.js — PDF to Markdown conversion
 *
 * WHY: This service is the ONLY place in the Node.js application
 * that knows Python exists. It spawns python/parser.py as a subprocess,
 * pipes the PDF path in as an argument, and captures Markdown from stdout.
 *
 * Responsibilities:
 *   - Locate the Python interpreter and parser script
 *   - Spawn the subprocess
 *   - Collect stdout (the Markdown)
 *   - Collect stderr (errors from Python)
 *   - Handle non-zero exit codes
 *   - Clean up the uploaded file after parsing (always)
 *
 * This service knows NOTHING about AI, prompts, or HTTP.
 */

import { spawn }  from 'child_process';
import path       from 'path';
import fs         from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the Python parsing script
const PARSER_SCRIPT = path.join(__dirname, '..', 'python', 'parser.py');

// Python command: try 'python3' first (Linux/Mac), fall back to 'python' (Windows)
// We resolve this at module level so it's determined once, not per-request.
const PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';

/**
 * Creates a typed DocumentParseError for the error handler to map correctly.
 */
function createParseError(message) {
  const err = new Error(message);
  err.name = 'DocumentParseError';
  return err;
}

/**
 * parse(filePath) — Convert a PDF to Markdown.
 *
 * @param   {string} filePath  Absolute path to the uploaded PDF file
 * @returns {Promise<string>}  The Markdown content of the document
 * @throws  {Error}            DocumentParseError if conversion fails
 */
async function parse(filePath) {
  return new Promise((resolve, reject) => {
    let stdoutData = '';
    let stderrData = '';

    const child = spawn(PYTHON_CMD, [PARSER_SCRIPT, filePath], {
      // Isolated environment — inherit PATH and force UTF-8 encoding
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', (err) => {
      // The spawn itself failed (e.g., python not installed)
      cleanupFile(filePath);
      reject(createParseError(
        `Could not start the Python parser. ` +
        `Is Python installed and on your PATH?\n\nDetails: ${err.message}`
      ));
    });

    child.on('close', (exitCode) => {
      // Always delete the uploaded file, regardless of success or failure
      cleanupFile(filePath);

      if (exitCode !== 0) {
        const detail = stderrData.trim() || 'Unknown Python error.';
        reject(createParseError(`PDF parsing failed: ${detail}`));
        return;
      }

      const markdown = stdoutData.trim();
      if (!markdown) {
        reject(createParseError(
          'The PDF appears to be empty or contains only images. ' +
          'Please upload a text-based PDF resume.'
        ));
        return;
      }

      resolve(markdown);
    });
  });
}

/**
 * cleanupFile — Deletes a file silently.
 * WHY: Uploaded PDFs should never persist on disk after processing.
 * Failure to delete should not crash the application.
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Silent: deletion failure is non-critical
    console.error(`[documentParserService] Could not delete file: ${filePath}`);
  }
}

export default { parse };

/**
 * matchController.js — HTTP request/response handler
 *
 * WHY: This is the ONLY file that knows about Express req/res.
 * It is deliberately thin:
 *   1. Extract inputs from the request
 *   2. Validate that required inputs are present (HTTP-level validation)
 *   3. Call the service layer
 *   4. Format and send the response
 *
 * Business logic, file I/O, AI calls — none of that lives here.
 * If a thrown error reaches this handler, it passes to the next()
 * middleware (errorHandler.js) rather than being handled inline.
 *
 * This keeps controllers easy to test and free of business logic.
 */

import matcherService from '../services/matcherService.js';

/**
 * handleMatch — POST /api/match
 *
 * Expects:
 *   - req.file          (from uploadMiddleware: the uploaded PDF)
 *   - req.body.job_description  (text field from the form)
 */
async function handleMatch(req, res, next) {
  try {
    // ── Input extraction ─────────────────────────────────────────────────────
    const uploadedFile   = req.file;
    const jobDescription = req.body?.job_description?.trim();

    // ── HTTP-level validation ─────────────────────────────────────────────────
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided. Please upload a PDF file.',
      });
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required.',
      });
    }

    if (jobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide at least 50 characters.',
      });
    }

    // ── Delegate to the service layer ─────────────────────────────────────────
    const result = await matcherService.match(uploadedFile.path, jobDescription);

    // ── Success response ──────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data:    result,
    });

  } catch (err) {
    // Pass to errorHandler.js — do NOT handle here
    next(err);
  }
}

export default { handleMatch };

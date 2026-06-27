/**
 * Validator — Input validation service
 *
 * WHY: Centralizes all validation logic. Components remain simple by
 * delegating all validation decisions to this service.
 * Returns structured error objects so UI can display meaningful messages.
 */

import { VALIDATION } from '../utils/constants.js';
import logger from '../utils/logger.js';

const log = logger.child('Validator');

/**
 * Validation result structure
 * @typedef {{ valid: boolean, error: string | null }} ValidationResult
 */
function ok()        { return { valid: true,  error: null }; }
function fail(error) { return { valid: false, error }; }

const Validator = {
  /**
   * Validates a file for PDF upload requirements.
   * Checks MIME type, extension, and file size.
   */
  validatePDFFile(file) {
    if (!file) {
      return fail('Please select a PDF file to upload.');
    }

    // Check MIME type (primary check)
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPDF) {
      return fail('Only PDF files are accepted. Please upload a .pdf file.');
    }

    // Check file size
    if (file.size === 0) {
      return fail('The selected file is empty. Please upload a valid PDF.');
    }

    if (file.size > VALIDATION.FILE.MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return fail(
        `File is ${sizeMB}MB, which exceeds the ${VALIDATION.FILE.MAX_SIZE_LABEL} limit. Please compress your PDF.`
      );
    }

    log.debug('File validation passed', { name: file.name, size: file.size });
    return ok();
  },

  /**
   * Validates resume text content.
   * Ensures text is present and within acceptable bounds.
   */
  validateResumeText(text) {
    const trimmed = (text || '').trim();

    if (!trimmed) {
      return fail('Resume text is required. Please upload a PDF resume.');
    }

    if (trimmed.length < VALIDATION.TEXT.MIN_LENGTH) {
      return fail(
        `Resume text is too short (${trimmed.length} chars). ` +
        `Please upload a complete resume with at least ${VALIDATION.TEXT.MIN_LENGTH} characters.`
      );
    }

    if (trimmed.length > VALIDATION.TEXT.MAX_LENGTH) {
      return fail(
        `Resume text is too long (${trimmed.length.toLocaleString()} chars). ` +
        `Maximum is ${VALIDATION.TEXT.MAX_LENGTH.toLocaleString()} characters.`
      );
    }

    return ok();
  },

  /**
   * Validates the job description text.
   * Enforces minimum content requirement.
   */
  validateJobDescription(text) {
    const trimmed = (text || '').trim();
    const { MIN_LENGTH, MAX_LENGTH } = VALIDATION.TEXT.JOB_DESCRIPTION;

    if (!trimmed) {
      return fail('Please paste a job description to analyze against.');
    }

    if (trimmed.length < MIN_LENGTH) {
      return fail(
        `Job description is too short (${trimmed.length} chars). ` +
        `Please provide at least ${MIN_LENGTH} characters for accurate analysis.`
      );
    }

    if (trimmed.length > MAX_LENGTH) {
      return fail(
        `Job description is too long (${trimmed.length.toLocaleString()} chars). ` +
        `Maximum is ${MAX_LENGTH.toLocaleString()} characters.`
      );
    }

    return ok();
  },

  /**
   * Validates the full form before submission.
   * Returns a combined error if any field fails.
   */
  validateFormSubmission(file, jobDescription) {
    const fileResult = this.validatePDFFile(file);
    if (!fileResult.valid) return fileResult;

    const jdResult = this.validateJobDescription(jobDescription);
    if (!jdResult.valid) return jdResult;

    return ok();
  },

  /**
   * Removes potentially dangerous characters from user text.
   * Not a security measure (backend handles that), just cleanliness.
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    // Trim leading/trailing whitespace, normalize multiple spaces
    return text.trim().replace(/\s+/g, ' ');
  },

  /**
   * Basic email format validation
   */
  isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  },
};

export default Validator;

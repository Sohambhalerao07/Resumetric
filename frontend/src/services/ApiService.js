/**
 * ApiService — HTTP client for backend communication
 *
 * WHY: Centralizes all API calls in one place. Components never call axios
 * directly — they go through this service. Provides retry logic, consistent
 * error formatting, and request/response logging.
 *
 * Pattern: Singleton with static methods.
 */

import axios from 'axios';
import { API } from '../utils/constants.js';
import logger from '../utils/logger.js';

const log = logger.child('ApiService');

/**
 * Custom error class for API errors.
 * Gives consumers structured error information.
 */
export class ApiError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name       = 'ApiError';
    this.statusCode = statusCode || null;
    this.details    = details   || null;
  }
}

/**
 * Creates the axios instance with base config
 */
const httpClient = axios.create({
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Response interceptor — normalize all errors
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response received)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new ApiError(
          'Request timed out. The AI analysis is taking too long — please try again.',
          408
        );
      }
      throw new ApiError(
        'Cannot connect to the server. Please check that the backend is running.',
        0
      );
    }

    const { status, data } = error.response;
    const serverMessage = data?.error || data?.message || 'An unexpected error occurred.';

    switch (status) {
      case 400:
        throw new ApiError(`Invalid request: ${serverMessage}`, 400, data);
      case 413:
        throw new ApiError('File is too large for the server to process.', 413);
      case 422:
        throw new ApiError(`Validation failed: ${serverMessage}`, 422, data);
      case 429:
        throw new ApiError('Too many requests. Please wait a moment and try again.', 429);
      case 500:
      case 502:
      case 503:
        throw new ApiError(`Server error: ${serverMessage}`, status, data);
      default:
        throw new ApiError(serverMessage, status, data);
    }
  }
);

/**
 * Exponential backoff retry logic
 * Only retries on network errors and 5xx responses, not client errors (4xx)
 */
async function withRetry(fn, attempts = API.RETRY_ATTEMPTS) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (bad request, not found, etc.)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      if (attempt < attempts) {
        const delayMs = API.RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
        log.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`, { error: error.message });
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

const ApiService = {
  /**
   * Main analysis endpoint.
   * Sends the PDF file and job description to the backend.
   *
   * @param {File}     pdfFile        - PDF resume file
   * @param {string}   jobDescription - Job description text
   * @param {Function} onProgress     - Upload progress callback (0-100)
   * @returns {Promise<object>} Raw API response data
   */
  async analyzeResume(pdfFile, jobDescription, onProgress) {
    log.info('Starting resume analysis', {
      fileName: pdfFile?.name,
      fileSize: pdfFile?.size,
      jdLength: jobDescription?.length,
    });

    const formData = new FormData();
    formData.append('resume', pdfFile);
    formData.append('job_description', jobDescription);

    return withRetry(async () => {
      const response = await httpClient.post(API.ENDPOINTS.ANALYZE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      log.info('Analysis complete', { status: response.status });
      return response.data;
    });
  },

  /**
   * Health check — verifies the backend is reachable
   */
  async healthCheck() {
    try {
      const response = await httpClient.get(API.ENDPOINTS.HEALTH, { timeout: 5_000 });
      return response.status === 200;
    } catch {
      return false;
    }
  },
};

export default ApiService;

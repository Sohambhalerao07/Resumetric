/**
 * Constants — Application-wide configuration
 *
 * WHY: Single source of truth for all magic numbers and configuration.
 * Changing a value here updates behavior everywhere it's used.
 * Prevents hardcoded values scattered across files.
 */

// --- API Configuration ---
export const API = {
  // Base URL from environment variable, fallback for local development
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

  // Timeout in milliseconds (60 seconds — AI processing can be slow)
  TIMEOUT: 60_000,

  // Retry attempts on failure
  RETRY_ATTEMPTS: 3,

  // Base delay for exponential backoff (milliseconds)
  RETRY_BASE_DELAY: 1_000,

  // Endpoints
  ENDPOINTS: {
    ANALYZE: '/match',
    HEALTH:  '/health',
  },
};

// --- Validation Constraints ---
export const VALIDATION = {
  FILE: {
    MAX_SIZE:       10 * 1024 * 1024, // 10MB in bytes
    MAX_SIZE_LABEL: '10MB',
    ACCEPTED_TYPES: ['application/pdf'],
    ACCEPTED_EXTENSION: '.pdf',
  },

  TEXT: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 50_000,

    JOB_DESCRIPTION: {
      MIN_LENGTH: 50,
      MAX_LENGTH: 10_000,
    },
  },
};

// --- Analysis Progress Steps ---
// These labels are shown in the loading screen during analysis
export const ANALYSIS_STEPS = [
  { id: 'upload',   label: 'Uploading your resume...',          icon: 'Upload' },
  { id: 'extract',  label: 'Extracting resume content...',      icon: 'FileText' },
  { id: 'analyze',  label: 'Analyzing with OpenRouter AI...',   icon: 'Cpu' },
  { id: 'score',    label: 'Generating match score...',          icon: 'BarChart2' },
  { id: 'insights', label: 'Preparing insights & tips...',       icon: 'Lightbulb' },
];

// --- Score Thresholds ---
export const SCORE = {
  EXCELLENT: 80,  // >= 80%: Excellent match
  GOOD:      60,  // >= 60%: Good match
  FAIR:      40,  // >= 40%: Fair match
  POOR:       0,  // <  40%: Needs work
};

// --- Toast Config ---
export const TOAST = {
  DEFAULT_DURATION: 4_000, // 4 seconds
  MAX_TOASTS:       5,
};

// --- App Metadata ---
export const APP = {
  NAME:        'Resumetric',
  TAGLINE:     'AI-Powered Resume Analysis',
  DESCRIPTION: 'Compare your resume to any job description using OpenRouter AI',
  VERSION:     '1.0.0',
};

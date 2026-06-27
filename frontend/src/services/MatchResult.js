/**
 * MatchResult — API response transformer and formatter
 *
 * WHY: The API response shape shouldn't be known to UI components.
 * This service normalizes the response, adds computed properties,
 * and provides display-ready formatted data.
 *
 * Pattern: Factory functions (not a class) for easier testing.
 */

import { SCORE } from '../utils/constants.js';
import logger from '../utils/logger.js';

const log = logger.child('MatchResult');

/**
 * Creates a normalized MatchResult object from raw API response.
 *
 * Expected API response shape:
 * {
 *   match_score: number (0-100),
 *   strengths: string[],
 *   missing_skills: string[],
 *   recommendations: string[],
 *   summary?: string,
 * }
 */
function create(apiResponse) {
  if (!apiResponse || typeof apiResponse !== 'object') {
    log.error('Invalid API response passed to MatchResult.create', apiResponse);
    throw new Error('Invalid analysis response from server.');
  }

  // Normalize score: handle 'score', 'match_score', and 'matchScore' key variants
  const rawScore = apiResponse.score ?? apiResponse.match_score ?? apiResponse.matchScore ?? 0;
  const score    = Math.max(0, Math.min(100, Math.round(Number(rawScore))));

  const strengths        = formatArray(apiResponse.strengths);
  const missingSkills    = formatArray(apiResponse.missing_skills    ?? apiResponse.missingSkills);
  const recommendations  = formatArray(apiResponse.recommendations);
  const summary          = typeof apiResponse.summary === 'string' ? apiResponse.summary.trim() : null;

  const result = {
    score,
    strengths,
    missingSkills,
    recommendations,
    summary,

    // Computed display properties
    label:         getScoreLabel(score),
    color:         getScoreColor(score),
    isGoodMatch:   isGoodMatch(score),
    isExcellentMatch: isExcellentMatch(score),

    // Metadata
    analyzedAt:    new Date().toISOString(),
  };

  log.info('MatchResult created', { score, label: result.label });
  return result;
}

/**
 * Normalizes an array field from the API.
 * Handles null, non-array, and cleans individual strings.
 */
function formatArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => (typeof item === 'string' ? item.trim() : String(item)))
    .filter(Boolean);  // Remove empty strings
}

/**
 * Returns a human-readable label for a score.
 */
function getScoreLabel(score) {
  if (score >= SCORE.EXCELLENT) return 'Excellent Match';
  if (score >= SCORE.GOOD)      return 'Good Match';
  if (score >= SCORE.FAIR)      return 'Fair Match';
  return 'Needs Improvement';
}

/**
 * Returns the semantic color key for a score.
 * Maps to CSS variable names in the design system.
 */
function getScoreColor(score) {
  if (score >= SCORE.EXCELLENT) return 'success';
  if (score >= SCORE.GOOD)      return 'info';
  if (score >= SCORE.FAIR)      return 'warning';
  return 'danger';
}

/**
 * True if score meets the "good" threshold.
 */
function isGoodMatch(score) {
  return score >= SCORE.GOOD;
}

/**
 * True if score meets the "excellent" threshold.
 */
function isExcellentMatch(score) {
  return score >= SCORE.EXCELLENT;
}

const MatchResult = {
  create,
  getScoreLabel,
  getScoreColor,
  isGoodMatch,
  isExcellentMatch,
  formatArray,
};

export default MatchResult;

/**
 * responseParser.js — LLM response validation and parsing
 *
 * WHY: LLMs can and do return unexpected output despite strict prompting:
 *   - JSON wrapped in markdown code fences (```json ... ```)
 *   - Leading/trailing explanation text
 *   - Missing or mistyped fields
 *   - Wrong types (score as string instead of number)
 *
 * This module is the trust boundary. It converts raw LLM text into
 * a validated, typed JavaScript object — or throws a ParseError.
 *
 * NEVER trust raw LLM output. ALWAYS validate here.
 */

/**
 * Creates a typed ParseError for the error handler to map to HTTP 422.
 */
function createParseError(message) {
  const err = new Error(message);
  err.name = 'ParseError';
  return err;
}

/**
 * parse(rawText) — Parse and validate the LLM's response.
 *
 * @param   {string} rawText  Raw text string from AIService.analyze()
 * @returns {object}          Validated result object
 * @throws  {Error}           ParseError if the output is invalid
 */
function parse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw createParseError('AI returned an empty response.');
  }

  // Step 1: Extract JSON from the raw text.
  // Some models wrap output in ```json ... ``` despite being told not to.
  const jsonString = extractJSON(rawText);

  // Step 2: Parse the JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw createParseError(
      'AI response could not be parsed as JSON. ' +
      'The model may have returned an unexpected format.'
    );
  }

  // Step 3: Check for the model's own error signal
  if (parsed.error === 'analysis_failed') {
    throw createParseError(
      'The AI was unable to analyze the provided content. ' +
      'Please ensure your resume and job description are clear and complete.'
    );
  }

  // Step 4: Validate required fields
  validateShape(parsed);

  // Step 5: Normalize and return a clean object
  return normalize(parsed);
}

/**
 * extractJSON — Pull the JSON string out of the raw LLM output.
 *
 * Handles:
 *   - Clean JSON (ideal case)
 *   - JSON wrapped in ```json ... ``` fences
 *   - JSON wrapped in ``` ... ``` fences
 *   - JSON with leading/trailing whitespace or explanation text
 */
function extractJSON(rawText) {
  const text = rawText.trim();

  // Case 1: Already clean JSON — starts with { or [
  if (text.startsWith('{') || text.startsWith('[')) {
    return text;
  }

  // Case 2: Wrapped in markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Case 3: JSON buried somewhere in the response — find the first { ... }
  const braceStart = text.indexOf('{');
  const braceEnd   = text.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1);
  }

  throw createParseError(
    'Could not locate JSON in the AI response. The model may have returned plain text instead.'
  );
}

/**
 * validateShape — Ensure all required fields are present and correctly typed.
 */
function validateShape(obj) {
  const issues = [];

  if (typeof obj.score !== 'number' && typeof obj.score !== 'string') {
    issues.push('"score" field is missing or has an invalid type.');
  }

  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    issues.push('"summary" field is missing or empty.');
  }

  if (!Array.isArray(obj.strengths)) {
    issues.push('"strengths" must be an array.');
  }

  if (!Array.isArray(obj.missingSkills) && !Array.isArray(obj.missing_skills)) {
    issues.push('"missingSkills" must be an array.');
  }

  if (!Array.isArray(obj.recommendations)) {
    issues.push('"recommendations" must be an array.');
  }

  if (issues.length > 0) {
    throw createParseError(
      `AI response is missing required fields: ${issues.join(' ')}`
    );
  }
}

/**
 * normalize — Convert raw parsed object into a clean, consistent shape.
 *
 * Handles:
 *   - Score as a string ("85") converted to integer
 *   - Both camelCase and snake_case field names from different models
 *   - Score clamped to 0–100
 *   - Arrays cleaned of empty/non-string items
 */
function normalize(raw) {
  const score = Math.max(0, Math.min(100, Math.round(Number(raw.score))));

  // Handle both missingSkills (camelCase) and missing_skills (snake_case)
  const missingSkills = raw.missingSkills || raw.missing_skills || [];

  return {
    score,
    summary:         String(raw.summary).trim(),
    strengths:       cleanArray(raw.strengths),
    missingSkills:   cleanArray(missingSkills),
    recommendations: cleanArray(raw.recommendations),
  };
}

/**
 * cleanArray — Remove empty items and ensure all items are strings.
 */
function cleanArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => (typeof item === 'string' ? item.trim() : String(item).trim()))
    .filter(Boolean);
}

export default { parse };

/**
 * matcherService.js — Pipeline orchestrator
 *
 * WHY: This service is the only place that knows the ORDER in which
 * the pipeline steps execute. It calls each service in sequence and
 * passes data through. No service knows about any other service —
 * they only talk to the orchestrator.
 *
 * This pattern means:
 *   - Each service is independently testable
 *   - The pipeline order can be changed in one place
 *   - A new step (e.g., caching, analytics) is added here, nowhere else
 *
 * This service knows NOTHING about HTTP (no req/res).
 * It only receives data and returns data.
 */

import documentParserService  from './documentParserService.js';
import resumeProcessorService from './resumeProcessorService.js';
import promptBuilderService   from './promptBuilderService.js';
import AIService              from './AIService.js';
import responseParser         from '../utils/responseParser.js';

/**
 * match(filePath, jobDescription) — Run the full resume matching pipeline.
 *
 * @param   {string} filePath        Absolute path to the uploaded PDF
 * @param   {string} jobDescription  Raw job description text from the request
 * @returns {Promise<object>}        Validated result: { score, summary, strengths, missingSkills, recommendations }
 * @throws  {Error}                  Any service error — let it bubble to the error handler
 */
async function match(filePath, jobDescription) {
  // ── Step 1: Convert PDF → Markdown ───────────────────────────────────────
  // Spawns python/parser.py, captures stdout, cleans up the file.
  const rawMarkdown = await documentParserService.parse(filePath);

  // ── Step 2: Clean and normalize the Markdown ──────────────────────────────
  // Removes whitespace artifacts, duplicate headings, invisible characters.
  // Reduces prompt size and improves LLM accuracy.
  const processedMarkdown = resumeProcessorService.process(rawMarkdown);

  // ── Step 3: Build the AI prompt ───────────────────────────────────────────
  // Returns an OpenAI-compatible messages array.
  const messages = promptBuilderService.build(processedMarkdown, jobDescription);

  // ── Step 4: Call the AI ───────────────────────────────────────────────────
  // Returns raw text string from the model's response.
  const rawAIResponse = await AIService.analyze(messages);

  // ── Step 5: Parse and validate the AI response ────────────────────────────
  // Extracts JSON, validates shape, normalizes types.
  const result = responseParser.parse(rawAIResponse);

  return result;
}

export default { match };

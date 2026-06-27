/**
 * resumeProcessorService.js — Markdown cleaning and normalization
 *
 * WHY: Raw MarkItDown output often contains:
 *   - Excessive blank lines from PDF whitespace artifacts
 *   - Malformed headings (e.g., "## ## Experience")
 *   - Junk characters from PDF encoding
 *   - Very long lines with no structure
 *
 * Cleaning here means the LLM receives a leaner, higher-quality prompt,
 * which improves accuracy and reduces token cost.
 *
 * This service knows NOTHING about AI, HTTP, or file I/O.
 * Input: raw Markdown string.
 * Output: cleaned Markdown string.
 */

/**
 * Maximum character length we'll send to the LLM.
 * Very long resumes waste tokens and rarely improve accuracy.
 * WHY 12,000: typical resume is 1,500–3,000 chars; 12k is generous headroom.
 */
const MAX_RESUME_CHARS = 12_000;

/**
 * process(rawMarkdown) — Clean and normalize raw Markdown from MarkItDown.
 *
 * @param   {string} rawMarkdown  Raw Markdown from documentParserService
 * @returns {string}              Cleaned, normalized Markdown
 */
function process(rawMarkdown) {
  let text = rawMarkdown;

  // 1. Normalize Windows line endings to Unix
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Remove PDF header/footer artifacts (page numbers, "Confidential", etc.)
  text = text.replace(/^Page\s+\d+(\s+of\s+\d+)?$/gim, '');

  // 3. Collapse duplicate heading markers (e.g., "## ## Experience" → "## Experience")
  text = text.replace(/^(#{1,6})\s+\1+\s*/gm, '$1 ');

  // 4. Normalize heading spacing: ensure single space after #
  text = text.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');

  // 5. Remove lines that are only whitespace or special characters (----, ====, ....)
  text = text.replace(/^[\s\-=_.]{4,}$/gm, '');

  // 6. Collapse 3+ consecutive blank lines into a single blank line
  text = text.replace(/\n{3,}/g, '\n\n');

  // 7. Remove zero-width characters and other invisible Unicode junk
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

  // 8. Trim trailing whitespace from every line
  text = text.split('\n').map(line => line.trimEnd()).join('\n');

  // 9. Trim leading/trailing document whitespace
  text = text.trim();

  // 10. Truncate if the document is unreasonably long.
  //     We truncate at a paragraph boundary where possible.
  if (text.length > MAX_RESUME_CHARS) {
    const truncated = text.slice(0, MAX_RESUME_CHARS);
    // Find the last complete paragraph boundary
    const lastBreak = truncated.lastIndexOf('\n\n');
    text = lastBreak > MAX_RESUME_CHARS * 0.8
      ? truncated.slice(0, lastBreak)
      : truncated;
    text += '\n\n[Resume truncated for analysis]';
  }

  return text;
}

export default { process };

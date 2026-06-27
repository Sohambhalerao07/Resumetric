/**
 * promptBuilderService.js — AI prompt construction
 *
 * WHY: Prompt strings must NEVER be scattered across the codebase.
 * All prompt engineering decisions live here and nowhere else.
 * If we need to tune the prompt, we come to this one file.
 *
 * Responsibilities:
 *   - Accept processed resume Markdown and job description text
 *   - Construct the system message (defines AI role and output rules)
 *   - Construct the user message (contains the actual data)
 *   - Return a messages array in OpenAI Chat Completions format
 *
 * This service knows NOTHING about HTTP, files, or AI providers.
 */

/**
 * build(resumeMarkdown, jobDescription) — Build the prompt messages array.
 *
 * Returns an OpenAI-compatible messages array:
 * [{ role: 'system', content: '...' }, { role: 'user', content: '...' }]
 *
 * @param   {string}   resumeMarkdown   Cleaned Markdown of the resume
 * @param   {string}   jobDescription   Raw job description text
 * @returns {Array<{role: string, content: string}>}
 */
function build(resumeMarkdown, jobDescription) {
  const systemMessage = buildSystemMessage();
  const userMessage   = buildUserMessage(resumeMarkdown, jobDescription);

  return [
    { role: 'system', content: systemMessage },
    { role: 'user',   content: userMessage   },
  ];
}

/**
 * buildSystemMessage — Defines the AI's role and strict output rules.
 *
 * WHY system message: LLMs follow role instructions more reliably when
 * given in the system turn rather than buried in the user message.
 * The strict JSON requirement here avoids the need to strip markdown fences.
 */
function buildSystemMessage() {
  return `You are an expert ATS (Applicant Tracking System) and senior recruiter with deep knowledge of resume analysis and job matching.

Your task is to analyze a candidate's resume against a job description and produce a structured match assessment.

CRITICAL OUTPUT RULES — you MUST follow these exactly:
1. Respond with ONLY valid JSON. No markdown. No code fences. No explanations. No comments.
2. The JSON must match this exact schema:
{
  "score": <integer 0-100>,
  "summary": <string, 2-3 sentences about overall match>,
  "strengths": <array of strings, each a specific strength from the resume>,
  "missingSkills": <array of strings, each a specific missing skill or gap>,
  "recommendations": <array of strings, each a concrete, actionable improvement>
}
3. "score" must be an integer between 0 and 100. Calculate this STRICTLY based on:
   - Core skills match (40%)
   - Years of experience matching the requirement (30%)
   - Role relevance and past achievements (20%)
   - Education/Certifications (10%)
   *CRITICAL SCORING GUIDELINE*: Be extremely critical. Do not give artificial high scores.
   - 90-100: Near perfect match, hits every single requirement.
   - 70-89: Strong match, but missing some nice-to-haves or slightly short on experience.
   - 50-69: Partial match, missing core skills or significant experience gaps.
   - Below 50: Poor match.
4. "strengths" must have 3-7 items.
5. "missingSkills" must have 2-6 items. Be ruthless in identifying gaps.
6. "recommendations" must have 3-6 items.
7. Every string must be specific and substantive — no generic advice.
8. If you cannot produce valid JSON for any reason, return: {"error": "analysis_failed"}
9. Do NOT wrap the JSON in backticks, markdown code fences, or any other formatting.`;
}

/**
 * buildUserMessage — Injects the actual resume and job description data.
 *
 * WHY separate sections with delimiters: Clear boundaries help the LLM
 * distinguish between the two inputs and avoid confusing content from
 * one section as instructions from the other.
 */
function buildUserMessage(resumeMarkdown, jobDescription) {
  const sanitizedJD = jobDescription.trim().slice(0, 8_000); // Cap JD at 8k chars

  return `Analyze the following resume against the job description.

=== RESUME START ===
${resumeMarkdown}
=== RESUME END ===

=== JOB DESCRIPTION START ===
${sanitizedJD}
=== JOB DESCRIPTION END ===

Provide your analysis as valid JSON only, following the schema exactly as instructed.`;
}

export default { build };

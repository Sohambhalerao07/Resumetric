/**
 * AIService.js — OpenRouter API client
 *
 * WHY: This is the ONLY module that knows OpenRouter exists.
 * The rest of the application calls analyze(messages) and receives
 * raw text back. Swapping to a different provider (Anthropic, OpenAI, etc.)
 * requires changes to this file ONLY.
 *
 * Responsibilities:
 *   - Read configuration from aiConfig.js
 *   - POST to OpenRouter's chat completions endpoint
 *   - Return raw response text from the model
 *   - Handle network errors and API errors with clear messages
 *
 * This service knows NOTHING about the prompt content, file I/O, or HTTP requests
 * from the client side.
 */

import axios  from 'axios';
import aiConfig from '../config/aiConfig.js';

/**
 * Creates a typed AIError so errorHandler.js maps it to HTTP 502.
 */
function createAIError(message) {
  const err = new Error(message);
  err.name = 'AIError';
  return err;
}

/**
 * analyze(messages) — Send a prompt to the AI and get the raw response text.
 *
 * @param   {Array<{role: string, content: string}>} messages  Chat messages array
 * @returns {Promise<string>}  Raw text content from the model's response
 * @throws  {Error}            AIError if the request fails
 */
async function analyze(messages) {
  const requestBody = {
    model:       aiConfig.model,
    messages,
    temperature: 0.2,  // Low temperature: we want consistent, structured output
    max_tokens:  1500, // JSON response shouldn't need more than this
  };

  try {
    const response = await axios.post(
      `${aiConfig.baseUrl}${aiConfig.endpoint}`,
      requestBody,
      {
        headers: {
          'Authorization':  `Bearer ${aiConfig.apiKey}`,
          'Content-Type':   'application/json',
          'HTTP-Referer':   aiConfig.siteUrl,
          'X-Title':        aiConfig.siteName,
        },
        timeout: aiConfig.timeout,
      }
    );

    // Validate the response has the expected shape
    const choice = response.data?.choices?.[0];
    if (!choice) {
      throw createAIError('OpenRouter returned an empty response. The model may have refused the request.');
    }

    const content = choice.message?.content;
    if (!content || typeof content !== 'string') {
      throw createAIError('OpenRouter response did not contain expected text content.');
    }

    return content.trim();

  } catch (err) {
    // Re-throw our own typed errors as-is
    if (err.name === 'AIError') throw err;

    // Handle axios-specific errors
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw createAIError(
        'The AI request timed out. The model may be under heavy load. Please try again.'
      );
    }

    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.error?.message || err.response.statusText;

      if (status === 401) {
        throw createAIError('Invalid OpenRouter API key. Check your OPENROUTER_API_KEY in .env');
      }
      if (status === 402) {
        throw createAIError('OpenRouter account has insufficient credits.');
      }
      if (status === 429) {
        throw createAIError('OpenRouter rate limit reached. Please wait a moment and try again.');
      }
      if (status >= 500) {
        throw createAIError(`OpenRouter service error (${status}): ${detail}`);
      }

      throw createAIError(`AI request failed (${status}): ${detail}`);
    }

    // Network-level error (no response received)
    throw createAIError(
      `Could not reach the AI provider. Check your internet connection.\n\nDetails: ${err.message}`
    );
  }
}

export default { analyze };

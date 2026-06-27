/**
 * aiConfig.js — AI provider configuration
 *
 * WHY: Centralises every AI-related environment variable in one place.
 * Any service that needs the API key, model name, or endpoint reads from
 * here — not directly from process.env. This means:
 *   1. If we switch providers, we change this file only.
 *   2. Missing config is caught at startup, not mid-request.
 *   3. No env var typos scattered across multiple files.
 */

// Validate required env vars at import time.
// Fail fast: a missing key is better caught at startup than during a live request.
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Check your .env file and ensure "${name}" is set.`
    );
  }
  return value;
}

const aiConfig = {
  apiKey:   requireEnv('OPENROUTER_API_KEY'),
  model:    requireEnv('MODEL'),

  // OpenRouter uses an OpenAI-compatible endpoint
  baseUrl:  'https://openrouter.ai/api/v1',
  endpoint: '/chat/completions',

  // Request timeout in milliseconds (90s — LLMs can be slow on large docs)
  timeout:  90_000,

  // HTTP site header required by OpenRouter for attribution
  siteUrl:  'http://localhost:5000',
  siteName: 'ResumeMatcherAI',
};

export default aiConfig;

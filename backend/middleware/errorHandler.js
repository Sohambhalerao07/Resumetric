/**
 * errorHandler.js — Global Express error handling middleware
 *
 * WHY: Centralises all unhandled errors in one place.
 * No controller or service needs to know about HTTP status codes
 * or response formatting for errors — they just throw.
 *
 * Express identifies this as an error handler because it has
 * exactly four parameters: (err, req, res, next).
 */

/**
 * Map of custom error names to HTTP status codes.
 * Services throw errors with a specific `name` to control the status code
 * without importing HTTP knowledge into the service layer.
 */
const ERROR_STATUS_MAP = {
  ValidationError:    400,
  ParseError:         422,
  AIError:            502,
  DocumentParseError: 422,
};

/**
 * Global error handler — must be mounted LAST in Express middleware chain.
 */
function errorHandler(err, req, res, _next) {
  // Always log server-side so we can debug
  console.error(`[ERROR] ${req.method} ${req.path} — ${err.name || 'Error'}: ${err.message}`);

  const status  = ERROR_STATUS_MAP[err.name] || 500;
  const message = status < 500
    ? err.message  // Safe to expose client errors (4xx)
    : 'An unexpected error occurred. Please try again.'; // Hide server internals (5xx)

  res.status(status).json({
    success: false,
    message,
  });
}

export default errorHandler;

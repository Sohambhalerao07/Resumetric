/**
 * Logger — Structured logging utility
 *
 * WHY: Replaces raw console.log calls with structured, leveled logging.
 * In production, logs are suppressed to keep the console clean.
 * Provides consistent log format with timestamps and context.
 */

const IS_DEV = import.meta.env.DEV;

// Log level hierarchy
const LEVELS = {
  DEBUG: 0,
  INFO:  1,
  WARN:  2,
  ERROR: 3,
};

// Current minimum level (suppress debug in production)
const CURRENT_LEVEL = IS_DEV ? LEVELS.DEBUG : LEVELS.WARN;

/**
 * Format a log entry with timestamp and level badge
 */
function formatPrefix(level, context) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const ctx = context ? ` [${context}]` : '';
  return `[${timestamp}] [${level}]${ctx}`;
}

const logger = {
  debug: (message, data, context) => {
    if (CURRENT_LEVEL <= LEVELS.DEBUG) {
      const prefix = formatPrefix('DEBUG', context);
      data !== undefined
        ? console.debug(`%c${prefix}`, 'color: #6b7280', message, data)
        : console.debug(`%c${prefix}`, 'color: #6b7280', message);
    }
  },

  info: (message, data, context) => {
    if (CURRENT_LEVEL <= LEVELS.INFO) {
      const prefix = formatPrefix('INFO', context);
      data !== undefined
        ? console.info(`%c${prefix}`, 'color: #2563eb', message, data)
        : console.info(`%c${prefix}`, 'color: #2563eb', message);
    }
  },

  warn: (message, data, context) => {
    if (CURRENT_LEVEL <= LEVELS.WARN) {
      const prefix = formatPrefix('WARN', context);
      data !== undefined
        ? console.warn(`%c${prefix}`, 'color: #f59e0b', message, data)
        : console.warn(`%c${prefix}`, 'color: #f59e0b', message);
    }
  },

  error: (message, data, context) => {
    if (CURRENT_LEVEL <= LEVELS.ERROR) {
      const prefix = formatPrefix('ERROR', context);
      data !== undefined
        ? console.error(`%c${prefix}`, 'color: #ef4444', message, data)
        : console.error(`%c${prefix}`, 'color: #ef4444', message);
    }
  },

  /**
   * Create a child logger with a fixed context label
   * Usage: const log = logger.child('ApiService')
   */
  child: (context) => ({
    debug: (message, data) => logger.debug(message, data, context),
    info:  (message, data) => logger.info(message, data, context),
    warn:  (message, data) => logger.warn(message, data, context),
    error: (message, data) => logger.error(message, data, context),
  }),
};

export default logger;

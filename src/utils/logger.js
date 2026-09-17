/**
 * Simple logger utility with timestamps
 */
const logger = {
  info: (message, data = {}) => {
    console.log(
      `[${new Date().toISOString()}] INFO: ${message}`,
      Object.keys(data).length ? data : ""
    );
  },

  error: (message, error = null) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error?.message || error || "");
    if (error?.stack) {
      console.error(error.stack);
    }
  },

  warn: (message, data = {}) => {
    console.warn(
      `[${new Date().toISOString()}] WARN: ${message}`,
      Object.keys(data).length ? data : ""
    );
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${new Date().toISOString()}] DEBUG: ${message}`,
        Object.keys(data).length ? data : ""
      );
    }
  },
};

module.exports = logger;

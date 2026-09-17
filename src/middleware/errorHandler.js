const logger = require("../utils/logger");

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error", err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === "production" ? "An error occurred" : message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler, notFoundHandler };

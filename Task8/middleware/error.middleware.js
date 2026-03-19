const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperationalError = statusCode >= 400 && statusCode < 500;

  logger.error(err.message || "Unhandled error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    stack: err.stack,
    isOperationalError,
    details: err.details || null,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    details: err.details || undefined,
    requestId: req.requestId,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;

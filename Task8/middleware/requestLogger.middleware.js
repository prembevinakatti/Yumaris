const { randomUUID } = require("crypto");
const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();
  req.requestId = randomUUID();
  res.setHeader("x-request-id", req.requestId);

  logger.info("Incoming request", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;

    logger.info("Request completed", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
};

module.exports = requestLogger;

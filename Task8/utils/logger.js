const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");

const logsDirectory = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: {
    service: "yumaris-task8-api",
  },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: path.join(logsDirectory, "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(logsDirectory, "combined.log"),
    }),
  ],
});

module.exports = logger;

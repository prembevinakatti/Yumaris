require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/error.middleware");
const notFound = require("./middleware/notFound.middleware");
const requestLogger = require("./middleware/requestLogger.middleware");
const apiRoutes = require("./routes");
const openApiSpec = require("./docs/openapi");
const logger = require("./utils/logger");

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
	: true;

app.disable("x-powered-by");

app.use(
	cors({
		origin: corsOrigins,
		credentials: true,
	})
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "API is healthy",
		timestamp: new Date().toISOString(),
	});
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
	await connectDB();
	app.listen(PORT, () => {
		logger.info("Server started", { port: PORT, env: process.env.NODE_ENV || "development" });
	});
};

if (require.main === module) {
	startServer().catch((error) => {
		logger.error("Failed to bootstrap server", {
			message: error.message,
			stack: error.stack,
		});
		process.exit(1);
	});
}

module.exports = { app, startServer };

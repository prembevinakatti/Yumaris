const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth.route");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
	origin: process.env.CLIENT_URL || "http://localhost:5173",
	credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Authentication API is running",
	});
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
	return res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
	await connectDB();
	app.listen(PORT, () => {
		console.log(`Server running on PORT ${PORT}`);
	});
};

startServer().catch((error) => {
	console.error("Failed to start server:", error.message);
	process.exit(1);
});

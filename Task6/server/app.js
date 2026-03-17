const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userAuth = require("./routes/auth.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/user/auth", userAuth);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on PORT ${PORT}`);
});
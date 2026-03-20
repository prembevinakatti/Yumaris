const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;

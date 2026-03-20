const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  try {
    if (!process.env.USER_JWT_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "USER_JWT_TOKEN is missing in environment variables",
      });
    }

    const cookieToken = req.cookies.userToken;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.USER_JWT_TOKEN);
    req.userId = decoded.userId;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = isAuthenticated;

const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const extractToken = (req) => {
  const cookieToken = req.cookies?.accessToken;
  const authHeader = req.headers.authorization;

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  return cookieToken || bearerToken;
};

const isAuthenticated = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, process.env.USER_JWT_TOKEN);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Unauthorized: Invalid or expired token"));
    }

    return next(error);
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: Insufficient permissions"));
    }

    return next();
  };
};

module.exports = { isAuthenticated, authorizeRoles };

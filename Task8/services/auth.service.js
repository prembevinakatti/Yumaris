const jwt = require("jsonwebtoken");
const { User, ROLES } = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "1d";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.USER_JWT_TOKEN,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
};

const registerUser = async ({ fullName, email, password, role, adminSecret }) => {
  if (!fullName || !email || !password) {
    throw new ApiError(400, "fullName, email and password are required");
  }

  const normalizedEmail = normalizeEmail(email);
  const requestedRole = role ? String(role).toUpperCase() : ROLES.CUSTOMER;

  if (!Object.values(ROLES).includes(requestedRole)) {
    throw new ApiError(400, "Invalid role. Allowed values are ADMIN and CUSTOMER");
  }

  if (requestedRole === ROLES.ADMIN) {
    if (!process.env.ADMIN_SECRET) {
      throw new ApiError(500, "ADMIN_SECRET is not configured");
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new ApiError(403, "Invalid admin secret");
    }
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password,
    role: requestedRole,
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const passwordMatched = await user.comparePassword(password);
  if (!passwordMatched) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.lastLoginAt = new Date();
  await user.save();

  return user;
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

module.exports = {
  generateAccessToken,
  registerUser,
  loginUser,
  getUserProfile,
};

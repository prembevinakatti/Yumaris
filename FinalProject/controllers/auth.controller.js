const jwt = require("jsonwebtoken");
const User = require("../models/auth.model");
const {
  registerValidation,
  loginValidation,
} = require("../validators/user.validator");

const COOKIE_NAME = "userToken";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
});

const buildToken = (userId) => {
  if (!process.env.USER_JWT_TOKEN) {
    const error = new Error("USER_JWT_TOKEN is missing in environment variables");
    error.status = 500;
    throw error;
  }

  return jwt.sign({ userId }, process.env.USER_JWT_TOKEN, { expiresIn: "1d" });
};

const sanitizeUser = (userDocument) => {
  const user = userDocument.toObject();
  delete user.password;
  return user;
};

module.exports.userRegister = async (req, res, next) => {
  try {
    const validation = registerValidation(req.body);
    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const username = String(req.body.username).trim();
    const email = String(req.body.email).toLowerCase().trim();
    const password = String(req.body.password);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    const userToken = buildToken(newUser._id);
    res.cookie(COOKIE_NAME, userToken, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.userLogin = async (req, res, next) => {
  try {
    const validation = loginValidation(req.body);
    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const email = String(req.body.email).toLowerCase().trim();
    const password = String(req.body.password);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const userToken = buildToken(user._id);
    res.cookie(COOKIE_NAME, userToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.logoutUser = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

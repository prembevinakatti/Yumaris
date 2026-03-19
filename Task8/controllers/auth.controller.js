const asyncHandler = require("../middleware/asyncHandler");
const {
  generateAccessToken,
  registerUser,
  loginUser,
  getUserProfile,
} = require("../services/auth.service");

const buildCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
};

const registerController = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  const accessToken = generateAccessToken(user);

  res.cookie("accessToken", accessToken, buildCookieOptions());

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      accessToken,
    },
  });
});

const loginController = asyncHandler(async (req, res) => {
  const user = await loginUser(req.body);
  const accessToken = generateAccessToken(user);

  res.cookie("accessToken", accessToken, buildCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      accessToken,
    },
  });
});

const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    ...buildCookieOptions(),
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

const meController = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.userId);

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: {
      user,
    },
  });
});

module.exports = {
  registerController,
  loginController,
  logoutController,
  meController,
};

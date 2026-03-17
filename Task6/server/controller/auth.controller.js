const userAuthModel = require("../models/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================

module.exports.userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check user
    const existingUser = await userAuthModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await userAuthModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // generate token
    const userToken = jwt.sign(
      { userId: newUser._id },
      process.env.USER_JWT_TOKEN,
      { expiresIn: "1d" }
    );

    res.cookie("userToken", userToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};

// ================= LOGIN =================

module.exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userAuthModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const userToken = jwt.sign(
      { userId: user._id },
      process.env.USER_JWT_TOKEN,
      { expiresIn: "1d" }
    );

    res.cookie("userToken", userToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// ================= GET USER =================

module.exports.getUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userAuthModel
      .findById(userId)
      .select("-password");

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
    console.error("Get User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};
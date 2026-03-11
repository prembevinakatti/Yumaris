const userAuthModel = require("../models/userAuth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(404).json({ message: "All fields are required" });
    }

    const existinguser = await userAuthModel.findOne({ email });

    if (existinguser) {
      return res.status(404).json({ message: "User already exists" });
    }
    const newuser = await userAuthModel.create({
      username,
      email,
      password,
    });

    if (!newuser) {
      return res.status(404).json({ message: "Error creating user", error });
    }

    const userToken = jwt.sign(
      { userId: newuser._id },
      process.env.USER_JWT_TOKEN,
    );
    res.cookie("userToken", userToken);

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: newuser,
    });
  } catch (error) {
    console.error("error");
    return res.status(500).json({ message: "Error in registering", error });
  }
};

module.exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userAuthModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ message: "Password does not match" });
    }

    const userToken = jwt.sign(
      { userId: user._id },
      process.env.USER_JWT_TOKEN,
    );
    res.cookie("userToken", userToken);

    return res
      .status(201)
      .json({ message: "User login successfully", success: true, user: user });
  } catch (error) {
    return res.status(500).json({ message: "Error in logging", error });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userAuthModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in getting user", error });
  }
};

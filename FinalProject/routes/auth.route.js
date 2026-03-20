const express = require("express");
const {
  userRegister,
  userLogin,
  logoutUser,
  getUser,
} = require("../controllers/auth.controller");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUser);

module.exports = router;

const express = require("express");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const {
  registerController,
  loginController,
  logoutController,
  meController,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", isAuthenticated, logoutController);
router.get("/me", isAuthenticated, meController);

module.exports = router;

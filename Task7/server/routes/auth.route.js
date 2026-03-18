const express = require("express");
const {
	userRegister,
	userLogin,
	logoutUser,
	getCurrentUser,
	getAdminDashboard,
	getUserDashboard,
	getAllUsers,
} = require("../controllers/auth.controller");
const { isAuthenticated, authorizeRoles } = require("../middleware/isAuthenticated");
const { ROLES } = require("../models/auth.model");

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", isAuthenticated, logoutUser);

router.get("/me", isAuthenticated, getCurrentUser);

router.get(
	"/admin/dashboard",
	isAuthenticated,
	authorizeRoles(ROLES.ADMIN),
	getAdminDashboard
);

router.get(
	"/admin/users",
	isAuthenticated,
	authorizeRoles(ROLES.ADMIN),
	getAllUsers
);

router.get(
	"/user/dashboard",
	isAuthenticated,
	authorizeRoles(ROLES.USER),
	getUserDashboard
);

module.exports = router;

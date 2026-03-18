const jwt = require("jsonwebtoken");
const { User, ROLES } = require("../models/auth.model");

const COOKIE_NAME = "userToken";
const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	maxAge: 24 * 60 * 60 * 1000,
};

const generateToken = (user) => {
	return jwt.sign(
		{
			userId: user._id,
			role: user.role,
		},
		process.env.USER_JWT_TOKEN,
		{ expiresIn: "1d" }
	);
};

const sanitizeUser = (userDocument) => {
	const user = userDocument.toObject();
	delete user.password;
	return user;
};

module.exports.userRegister = async (req, res) => {
	try {
		const { username, email, password, role } = req.body;
		const requestedRole = role ? String(role).toUpperCase() : ROLES.USER;

		if (!username || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Username, email and password are required",
			});
		}

		if (!Object.values(ROLES).includes(requestedRole)) {
			return res.status(400).json({
				success: false,
				message: "Invalid role. Allowed roles are ADMIN and USER",
			});
		}

		if (requestedRole === ROLES.ADMIN) {
			if (!process.env.ADMIN_SECRET) {
				return res.status(500).json({
					success: false,
					message: "ADMIN_SECRET is missing in environment variables",
				});
			}

			if (req.body.adminSecret !== process.env.ADMIN_SECRET) {
				return res.status(403).json({
					success: false,
					message: "Invalid admin secret",
				});
			}
		}

		const existingUser = await User.findOne({ email: String(email).toLowerCase() });
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
			role: requestedRole,
		});

		const userToken = generateToken(newUser);
		res.cookie(COOKIE_NAME, userToken, cookieOptions);

		return res.status(201).json({
			success: true,
			message: `${requestedRole} registered successfully`,
			user: sanitizeUser(newUser),
		});
	} catch (error) {
		console.error("Register Error:", error);
		return res.status(500).json({
			success: false,
			message: "Error registering user",
		});
	}
};

module.exports.userLogin = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Email and password are required",
			});
		}

		const user = await User.findOne({ email: String(email).toLowerCase() });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		const userToken = generateToken(user);
		res.cookie(COOKIE_NAME, userToken, cookieOptions);

		return res.status(200).json({
			success: true,
			message: "User logged in successfully",
			user: sanitizeUser(user),
		});
	} catch (error) {
		console.error("Login Error:", error);
		return res.status(500).json({
			success: false,
			message: "Error logging in",
		});
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

module.exports.getCurrentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select("-password");

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
		console.error("Get Current User Error:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching user",
		});
	}
};

module.exports.getAdminDashboard = async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Welcome Admin, this is a protected admin route",
		user: req.user,
	});
};

module.exports.getUserDashboard = async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Welcome User, this is a protected user route",
		user: req.user,
	});
};

module.exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select("username email role createdAt updatedAt");

		return res.status(200).json({
			success: true,
			count: users.length,
			users,
		});
	} catch (error) {
		console.error("Get All Users Error:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching users",
		});
	}
};

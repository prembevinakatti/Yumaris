const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
	try {
		const cookieToken = req.cookies.userToken;
		const authHeader = req.headers.authorization;
		const bearerToken = authHeader?.startsWith("Bearer ")
			? authHeader.split(" ")[1]
			: null;

		const token = cookieToken || bearerToken;

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized: No token provided",
			});
		}

		const decoded = jwt.verify(token, process.env.USER_JWT_TOKEN);

		req.user = {
			userId: decoded.userId,
			role: decoded.role,
		};

		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized: Invalid or expired token",
		});
	}
};

const authorizeRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: You do not have permission to access this resource",
			});
		}

		next();
	};
};

module.exports = { isAuthenticated, authorizeRoles };

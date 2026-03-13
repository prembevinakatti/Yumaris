const express = require("express");
const { userRegister, userLogin, getUser } = require("../controller/auth.controller");

const router = express.Router();

router.route("/userRegister").post(userRegister);
router.route("/userLogin").post(userLogin);
router.route("/getUser").get(getUser);

module.exports = router;

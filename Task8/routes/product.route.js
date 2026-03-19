const express = require("express");
const { ROLES } = require("../models/user.model");
const { isAuthenticated, authorizeRoles } = require("../middleware/isAuthenticated");
const {
  createProductController,
  listProductsController,
  getProductByIdController,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", listProductsController);
router.get("/:id", getProductByIdController);
router.post("/", isAuthenticated, authorizeRoles(ROLES.ADMIN), createProductController);

module.exports = router;

const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", isAuthenticated, createProduct);
router.put("/:id", isAuthenticated, updateProduct);
router.delete("/:id", isAuthenticated, deleteProduct);

module.exports = router;

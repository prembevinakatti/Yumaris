const express = require("express");
const authRoutes = require("./auth.route");
const productRoutes = require("./product.route");
const orderRoutes = require("./order.route");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Yumaris API v1",
    docsUrl: "/docs",
  });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

module.exports = router;

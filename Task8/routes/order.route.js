const express = require("express");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const {
  placeOrderController,
  getMyOrdersController,
  getOrderByIdController,
} = require("../controllers/order.controller");

const router = express.Router();

router.use(isAuthenticated);
router.post("/", placeOrderController);
router.get("/my", getMyOrdersController);
router.get("/:id", getOrderByIdController);

module.exports = router;

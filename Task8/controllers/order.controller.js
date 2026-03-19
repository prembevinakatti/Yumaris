const asyncHandler = require("../middleware/asyncHandler");
const {
  placeOrder,
  getMyOrders,
  getOrderById,
} = require("../services/order.service");

const placeOrderController = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: {
      order,
    },
  });
});

const getMyOrdersController = asyncHandler(async (req, res) => {
  const result = await getMyOrders(req.user.userId, req.query);

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: {
      order,
    },
  });
});

module.exports = {
  placeOrderController,
  getMyOrdersController,
  getOrderByIdController,
};

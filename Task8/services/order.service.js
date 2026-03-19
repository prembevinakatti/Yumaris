const Product = require("../models/product.model");
const { Order } = require("../models/order.model");
const { ROLES } = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const normalizePagination = ({ page = 1, limit = 10 } = {}) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  return { page: normalizedPage, limit: normalizedLimit };
};

const validateShippingAddress = (shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    throw new ApiError(400, "shippingAddress is required");
  }

  const requiredFields = ["line1", "city", "state", "postalCode", "country"];
  const missingField = requiredFields.find((field) => !shippingAddress[field]);

  if (missingField) {
    throw new ApiError(400, `shippingAddress.${missingField} is required`);
  }
};

const placeOrder = async (userId, payload) => {
  const { items, shippingAddress, notes } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "items must be a non-empty array");
  }

  validateShippingAddress(shippingAddress);

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isPublished: true });

  if (products.length !== productIds.length) {
    throw new ApiError(404, "One or more products are invalid or unavailable");
  }

  const productsMap = new Map(products.map((product) => [String(product._id), product]));

  let totalAmount = 0;
  const normalizedItems = [];

  for (const item of items) {
    const quantity = Number(item.quantity);
    const product = productsMap.get(String(item.productId));

    if (!product) {
      throw new ApiError(404, `Product ${item.productId} not found`);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, `Invalid quantity for product ${item.productId}`);
    }

    if (product.stock < quantity) {
      throw new ApiError(409, `${product.name} has only ${product.stock} units left in stock`);
    }

    const subtotal = Number((product.price * quantity).toFixed(2));
    totalAmount += subtotal;

    normalizedItems.push({
      product: product._id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      subtotal,
    });
  }

  await Promise.all(
    normalizedItems.map((item) => {
      return Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
    })
  );

  const order = await Order.create({
    user: userId,
    items: normalizedItems,
    shippingAddress,
    totalAmount: Number(totalAmount.toFixed(2)),
    currency: products[0].currency || "USD",
    notes,
  });

  return Order.findById(order._id)
    .populate("items.product", "name slug")
    .populate("user", "fullName email role");
};

const getMyOrders = async (userId, queryOptions = {}) => {
  const { page, limit } = normalizePagination(queryOptions);
  const skip = (page - 1) * limit;

  const [orders, totalItems] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.product", "name slug"),
    Order.countDocuments({ user: userId }),
  ]);

  return {
    items: orders,
    pagination: {
      totalItems,
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    },
  };
};

const getOrderById = async (orderId, currentUser) => {
  const order = await Order.findById(orderId)
    .populate("items.product", "name slug")
    .populate("user", "fullName email role");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const isAdmin = currentUser.role === ROLES.ADMIN;
  const isOwner = String(order.user._id) === String(currentUser.userId);

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, "You are not allowed to access this order");
  }

  return order;
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
};

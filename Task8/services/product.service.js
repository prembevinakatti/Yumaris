const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");

const normalizePagination = ({ page = 1, limit = 10 }) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  return { page: normalizedPage, limit: normalizedLimit };
};

const createProduct = async (payload, createdBy) => {
  const { name, description, category, price, currency, stock, isPublished } = payload;

  if (!name || !category || price === undefined) {
    throw new ApiError(400, "name, category and price are required");
  }

  const product = await Product.create({
    name,
    description,
    category,
    price,
    currency,
    stock,
    isPublished,
    createdBy,
  });

  return product;
};

const listProducts = async ({ page, limit, search, category, sort = "-createdAt" }) => {
  const { page: safePage, limit: safeLimit } = normalizePagination({ page, limit });

  const query = { isPublished: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (safePage - 1) * safeLimit;

  const [items, totalItems] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit)
      .select("name slug description category price currency stock createdAt"),
    Product.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      totalItems,
      currentPage: safePage,
      pageSize: safeLimit,
      totalPages: Math.ceil(totalItems / safeLimit) || 1,
    },
  };
};

const getProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
};

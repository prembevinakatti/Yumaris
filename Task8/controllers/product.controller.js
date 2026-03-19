const asyncHandler = require("../middleware/asyncHandler");
const {
  createProduct,
  listProducts,
  getProductById,
} = require("../services/product.service");

const createProductController = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body, req.user.userId);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: {
      product,
    },
  });
});

const listProductsController = asyncHandler(async (req, res) => {
  const result = await listProducts(req.query);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: result,
  });
});

const getProductByIdController = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: {
      product,
    },
  });
});

module.exports = {
  createProductController,
  listProductsController,
  getProductByIdController,
};

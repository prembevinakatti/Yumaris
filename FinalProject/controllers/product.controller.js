const mongoose = require("mongoose");
const Product = require("../models/product.model");

const validateProductInput = (body) => {
  const { name, price, stock } = body || {};

  if (!name || price === undefined || price === null) {
    return "Name and price are required";
  }

  if (String(name).trim().length < 2) {
    return "Name must be at least 2 characters";
  }

  if (Number(price) < 0 || Number.isNaN(Number(price))) {
    return "Price must be a valid non-negative number";
  }

  if (
    stock !== undefined &&
    stock !== null &&
    (Number(stock) < 0 || Number.isNaN(Number(stock)))
  ) {
    return "Stock must be a valid non-negative number";
  }

  return null;
};

module.exports.createProduct = async (req, res, next) => {
  try {
    console.log(req.userId)
    const validationError = validateProductInput(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const product = await Product.create({
      name: String(req.body.name).trim(),
      description: String(req.body.description || "").trim(),
      price: Number(req.body.price),
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 0,
      createdBy: req.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (name.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }
      updates.name = name;
    }

    if (req.body.description !== undefined) {
      updates.description = String(req.body.description).trim();
    }

    if (req.body.price !== undefined) {
      const price = Number(req.body.price);
      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }
      updates.price = price;
    }

    if (req.body.stock !== undefined) {
      const stock = Number(req.body.stock);
      if (Number.isNaN(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a valid non-negative number",
        });
      }
      updates.stock = stock;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

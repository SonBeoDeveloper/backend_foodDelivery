const Categories = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");

const Product = require("../models/productModel");
// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Categories.find();
    res.json(categories);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a category by ID
const getCategoriesById = asyncHandler(async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Categories not found" });
    }
    res.json(category);
  } catch (error) {
    throw new Error(error);
  }
});

// Create a new category
const createCategories = asyncHandler(async (req, res) => {
  try {
    const category = new Categories(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    throw new Error(err);
  }
});

// Update a category by ID
const updateCategoriesById = asyncHandler(async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Categories not found" });
    }
    category.name = req.body.name;
    await category.save();
    res.json(category);
  } catch (err) {
    throw new Error(err);
  }
});
// get all products in one Category
const getAllProductsInCategory = asyncHandler(async (req, res) => {
  try {
    const _id = req.params._id;
    const products = await Product.find({ category: _id });
    res.json(products);
  } catch (error) {
    throw new Error(err);
  }
});
// Delete a category by ID
const deleteCategoriesById = asyncHandler(async (req, res) => {
  const _id = req.params._id; // Lấy ID của danh mục từ đường dẫn

  try {
    // Trước tiên, lấy danh mục để xác minh xem nó có tồn tại không
    const category = await Categories.findById(_id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Tiếp theo, xóa tất cả sản phẩm thuộc về danh mục này
    await Product.deleteMany({ category: _id });

    // Sau đó, xóa danh mục
    await Categories.findByIdAndDelete(_id);

    return res.json({
      message: "Category and its products deleted successfully",
    });
  } catch (error) {
    throw new Error(error);
  }
});
const getProductsInCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId }).populate(
      "category"
    );
    res.json({ products });
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  getAllCategories,
  getAllProductsInCategory,
  getCategoriesById,
  createCategories,
  getProductsInCategory,
  updateCategoriesById,
  deleteCategoriesById,
};

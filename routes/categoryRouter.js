const express = require("express");
const router = express.Router();
const Categories = require("../controllers/categoryCtrl");
const auth = require("../middlewares/authMiddleware");

// Get all users
router.get("/", Categories.getAllCategories, auth.authMiddleware);
router.get(
  "/:_id/products",
  auth.authMiddleware,
  Categories.getAllProductsInCategory
);
// Create a new user
router.post(
  "/create",
  auth.authMiddleware,
  auth.isAdmin,
  Categories.createCategories
);
router.get("/:_id", auth.authMiddleware, Categories.getCategoriesById);
// Update a user by ID
router.put(
  "/:id",
  auth.authMiddleware,
  auth.isAdmin,
  Categories.updateCategoriesById
);

// Delete a user by ID
router.delete(
  "/:_id",
  auth.authMiddleware,
  auth.isAdmin,
  Categories.deleteCategoriesById
);

// get products in category
router.get(
  "/:id/products",
  auth.authMiddleware,
  Categories.getProductsInCategory
);

module.exports = router;

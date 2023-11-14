const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a category name"],
      unique: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);
categorySchema.path("name").validate(async function (value) {
  try {
    const count = await this.model("Category").countDocuments({ name: value });
    return !count;
  } catch (err) {
    throw err;
  }
}, "Category name already exists");
const Categories = mongoose.model("Category", categorySchema, "Categories");

module.exports = Categories;

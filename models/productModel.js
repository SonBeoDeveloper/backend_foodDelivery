const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: { type: String, required: true },
    price: {
      type: Number,
      min: [0, "Price must be at least 0"],
      required: [true, "Product price is required"],
    },
    images: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    address: { type: String },
    sold: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
productSchema.statics.findByCategoryId = function (categoryId) {
  return this.find({ Categories: categoryId });
};
const Product = mongoose.model("Product", productSchema);

module.exports = Product;

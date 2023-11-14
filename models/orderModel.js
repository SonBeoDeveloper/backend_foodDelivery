const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        count: Number,
      },
    ],
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Cash on Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
      ],
    },
    orderBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema, "Orders");

module.exports = Order;

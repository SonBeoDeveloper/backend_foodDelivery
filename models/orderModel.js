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
      default: "Chờ xác nhận",
      enum: [
        "Chờ xác nhận",
        "Đang chế biến",
        "Đang giao hàng",
        "Hủy xác nhận",
        "Đã nhận hàng",
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

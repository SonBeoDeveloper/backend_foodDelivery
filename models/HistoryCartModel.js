const mongoose = require("mongoose");

const historyCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cart: [],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const HistoryCart = mongoose.model(
  "HistoryCart",
  historyCartSchema,
  "HistoryCarts"
);
module.exports = HistoryCart;

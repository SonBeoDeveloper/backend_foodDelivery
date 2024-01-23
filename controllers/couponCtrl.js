const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const Coupon = require("../models/couponModel");
const cron = require("node-cron");
const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const getAll = await Coupon.find();
    res.json(getAll);
  } catch (error) {
    throw new Error(error);
  }
});
const getACoupon = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id);
  try {
    const getAll = await Coupon.findById(_id);
    res.json(getAll);
  } catch (error) {
    throw new Error(error);
  }
});
const updateCoupon = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id);
  try {
    const updateCoupon = await Coupon.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    res.json(updateCoupon);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteCoupon = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id);
  try {
    const deleteCoupon = await Coupon.findByIdAndDelete(_id);
    res.json(deleteCoupon);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteExpiredCoupons = async () => {
  try {
    const currentDate = new Date();
    // Tìm và xóa các coupon có thời gian hết hạn trước thời điểm hiện tại
    await Coupon.deleteMany({ expiry: { $lt: currentDate } });
    console.log("Đã xóa các coupon đã hết hạn.");
  } catch (error) {
    console.error("Lỗi khi xóa các coupon đã hết hạn", error);
  }
};

// Lên lịch trình chạy nhiệm vụ xóa các coupon đã hết hạn một lần mỗi ngày
const task = cron.schedule(
  "0 0 * * *",
  () => {
    deleteExpiredCoupons();
  },
  {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh", // Chỉnh sửa múi giờ cho đúng với múi giờ của bạn
  }
);

// Lắng nghe sự kiện khi kết thúc ứng dụng để dừng lịch trình cron
process.on("SIGINT", () => {
  task.stop();
  process.exit();
});
module.exports = {
  createCoupon,
  getAllCoupon,
  updateCoupon,
  deleteCoupon,
  getACoupon,
};

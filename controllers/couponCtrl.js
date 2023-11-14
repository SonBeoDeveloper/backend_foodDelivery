const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const Coupon = require("../models/couponModel");

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
module.exports = { createCoupon, getAllCoupon, updateCoupon, deleteCoupon };

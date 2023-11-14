const express = require("express");
const router = express.Router();
const couponCtrl = require("../controllers/couponCtrl");
const auth = require("../middlewares/authMiddleware");

router.post(
  "/create",
  auth.authMiddleware,
  auth.isAdmin,
  couponCtrl.createCoupon
);
router.get("/", auth.authMiddleware, auth.isAdmin, couponCtrl.getAllCoupon);
router.put("/:_id", auth.authMiddleware, auth.isAdmin, couponCtrl.updateCoupon);
router.delete(
  "/:_id",
  auth.authMiddleware,
  auth.isAdmin,
  couponCtrl.deleteCoupon
);

module.exports = router;

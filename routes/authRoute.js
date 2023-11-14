const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
router.post("/login", userCtrl.loginUserCtrl);
router.get("/cart", authMiddleware.authMiddleware, userCtrl.getUserCart);
router.get("/history", authMiddleware.authMiddleware, userCtrl.getHistory);
router.get(
  "/getallorder",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.getAllOrder
);
router.delete(
  "/deleteOrder/:id",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.deleteOrderByUser
);
router.post("/add-to-cart", authMiddleware.authMiddleware, userCtrl.addToCart);
router.post("/user-cart", authMiddleware.authMiddleware, userCtrl.userCart);
router.post(
  "/saveHistoryCart",
  authMiddleware.authMiddleware,
  userCtrl.saveHistoryCart
);
router.post(
  "/removeFromCart",
  authMiddleware.authMiddleware,
  userCtrl.removeCart
);
router.get(
  "/get-order-by-user/:id",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.getOrderByUser
);
router.post("/register", userCtrl.createUser);
router.post("/login-admin", userCtrl.loginAdminCtrl);
router.get("/wishlist", authMiddleware.authMiddleware, userCtrl.getWishlist);
router.get("/", userCtrl.getAllUser);
router.get("/get-order", authMiddleware.authMiddleware, userCtrl.getOrder);
router.put(
  "/update-order/:_id",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.updateOrderStatus
);
router.get("/logout", userCtrl.logout);
router.get("/refresh", userCtrl.handleRefreshToken);
router.post("/forgot-password-token", userCtrl.forgotPasswordToken);
router.post(
  "/applyCoupon",
  authMiddleware.authMiddleware,
  userCtrl.applyCoupon
);
router.get("/user-exist", async (req, res) => {
  const result = await userCtrl.checkUserExist(req.query);
  res.json(result);
});
router.put(
  "/save-address",
  authMiddleware.authMiddleware,
  userCtrl.saveAddress
);
router.delete("/empty-cart", authMiddleware.authMiddleware, userCtrl.emptyCart);
router.put("/reset-password", userCtrl.resetPassword);
router.post(
  "/cart/cash-order",
  authMiddleware.authMiddleware,
  userCtrl.createOrder
);
router.get("/get-user", authMiddleware.authMiddleware, userCtrl.getaUser);
router.get(
  "/allhistory",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.getAllHistory
);
router.put("/password", authMiddleware.authMiddleware, userCtrl.updatePassword);
router.delete("/:_id", userCtrl.deleteUser);
router.put("/edit", authMiddleware.authMiddleware, userCtrl.updatedUser);
router.put(
  "/block-user/:_id",
  authMiddleware.authMiddleware,
  userCtrl.blockUser
);
router.put(
  "/unblock-user/:_id",
  authMiddleware.authMiddleware,
  userCtrl.unblockUser
);
module.exports = router;

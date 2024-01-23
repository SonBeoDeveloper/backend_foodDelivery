const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
router.get(
  "/getRevenueLast7Days",
  authMiddleware.authMiddleware,
  userCtrl.getRevenueLast7Days,
  authMiddleware.isAdmin
);
router.get(
  "/confirmOrder",
  authMiddleware.authMiddleware,
  userCtrl.getConfirmOrder
);

router.get(
  "/get-order-history",
  authMiddleware.authMiddleware,
  userCtrl.getHistory
);
router.get(
  "/exportOrder/:orderId",
  authMiddleware.authMiddleware,
  userCtrl.exportOrder,
  authMiddleware.isAdmin
);
router.patch("/cancelOrder/:orderId", userCtrl.cancelOrder);
router.patch("/receiveOrder/:orderId", userCtrl.receiveOrder);
router.patch("/orders/:orderId", userCtrl.confirmOrder);
router.post("/login", userCtrl.loginUserCtrl);
router.get("/cart", authMiddleware.authMiddleware, userCtrl.getUserCart);
router.get(
  "/getallorder",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.getAllOrder
);
router.get(
  "/getorderwait",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.getOrderWait
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
router.get(
  "/idOrder/:_id",
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin,
  userCtrl.getIdOrder
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
router.put("/reset-passwords", userCtrl.resetPasswords);
router.post(
  "/cart/cash-order",
  authMiddleware.authMiddleware,
  userCtrl.createOrder
);
router.get("/get-user", authMiddleware.authMiddleware, userCtrl.getaUser);

router.put("/password", authMiddleware.authMiddleware, userCtrl.updatePassword);
router.delete(
  "/:_id",
  userCtrl.deleteUser,
  authMiddleware.authMiddleware,
  authMiddleware.isAdmin
);
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

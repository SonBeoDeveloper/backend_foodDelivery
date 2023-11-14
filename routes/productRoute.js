const express = require("express");

const productCtrl = require("../controllers/productCtrl");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImges");

router.post(
  "/create",
  auth.authMiddleware,
  auth.isAdmin,
  productCtrl.createProduct
);
router.get("/", productCtrl.getAllProduct);
router.put(
  "/upload/:_id",
  auth.authMiddleware,
  auth.isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  productCtrl.uploadImages
);
router.put("/rating", auth.authMiddleware, productCtrl.rating);
router.put("/wishlist", auth.authMiddleware, productCtrl.addToWishList);
router.get("/:_id", productCtrl.getaproduct);
router.put(
  "/update/:_id",
  auth.authMiddleware,
  auth.isAdmin,
  productCtrl.updateProduct
);
router.delete(
  "/:_id",
  auth.authMiddleware,
  auth.isAdmin,
  productCtrl.deleteProduct
);
module.exports = router;

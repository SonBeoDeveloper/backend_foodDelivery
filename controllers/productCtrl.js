const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const fs = require("fs");
const cloudinaryUploadImg = require("../utils/cloudinary");
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});
const updateProduct = asyncHandler(async (req, res) => {
  const _id = req.params;
  validateMongoDbId(_id);
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateProduct = await Product.findOneAndUpdate(_id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id);

  try {
    const deleteProduct = await Product.findOneAndDelete(_id);
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});
const getaproduct = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id);

  try {
    const findProduct = await Product.findById(_id).populate(
      "ratings.postedby"
    );
    res.json({ data: findProduct, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const getallproduct = await Product.find()
      .populate("ratings.postedby")
      .populate("category");
    res.json({ data: getallproduct, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  const { productId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishList.find(
      (id) => id.toString() === productId
    );
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishList: productId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishList: productId } },
        { new: true }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});
const rating = asyncHandler(async (req, res) => {
  const { _id, fullname } = req.user;
  validateMongoDbId(_id);

  const { star, productId, comment } = req.body;
  try {
    const product = await Product.findById(productId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment,
            "ratings.$.name": fullname,
          },
        },
        { new: true }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
              name: fullname,
            },
          },
        },
        {
          new: true,
        }
      );
      res.json(rateProduct);
    }
    const getAllRatings = await Product.findById(productId);
    let totalrating = getAllRatings.ratings.length;
    let ratingsum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalrating);
    let finalProduct = await Product.findByIdAndUpdate(
      productId,
      {
        totalrating: actualRating,
      },
      {
        new: true,
      }
    );

    res.json(finalProduct);
  } catch (error) {
    throw new Error(error);
  }
});
const uploadImages = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  validateMongoDbId(_id);
  console.log(req.files);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      console.log(newpath);
      urls.push(newpath);
      console.log(file);
      fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      _id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createProduct,
  getaproduct,
  addToWishList,
  getAllProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  rating,
};

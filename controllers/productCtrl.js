const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const Categories = require("../models/categoryModel");
const slugify = require("slugify");
const excelJS = require("exceljs");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const fs = require("fs");
const cloudinaryUploadImg = require("../utils/cloudinary");
const exportProduct = asyncHandler(async (req, res) => {
  try {
    let products = await Product.find({}).populate("category").lean(); // Lấy dữ liệu từ Product model
    const workbook = new excelJS.Workbook(); // Tạo một workbook mới
    const worksheet = workbook.addWorksheet("Product Data"); // Tạo một worksheet mới
    // Các cột trong file Excel
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Description", key: "description", width: 40 },
      { header: "Price", key: "price", width: 15 },
      { header: "Category", key: "category", width: 20 },
      // Thêm các cột khác tùy theo cần thiết
    ];
    // Thêm dữ liệu từ products vào worksheet
    products.forEach((product) => {
      // Đảm bảo dữ liệu phù hợp với cấu trúc của các cột
      const formattedData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category.name,
      };
      worksheet.addRow(formattedData);
    });
    // Lưu file Excel
    const filePath = "../files/products.xlsx"; // Đường dẫn file Excel
    await workbook.xlsx.writeFile("./files/products.xlsx");

    res.send({
      status: true,
      message: "File successfully exported",
      path: filePath,
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
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
  const { _id } = req.params;

  // Kiểm tra xem productId có phải là một ID hợp lệ hay không

  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }

    // Sử dụng findByIdAndUpdate để cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: _id },
      req.body,
      {
        new: true,
      }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }

    res.json(updatedProduct);
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    console.error(error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi trong quá trình cập nhật sản phẩm" });
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
      "ratings.postedby",
      "fullname email phone"
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
    let actualRating = (ratingsum / totalrating).toFixed(1);
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
const getProductByIdCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const products = await Product.find({ category: id });
    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for the given idCategory." });
    }
    res.json({ data: products, status: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
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
const getTopProducts = asyncHandler(async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); // Get the current year

    // Calculate the start and end date of the current year
    const startOfYear = new Date(currentYear, 0, 1); // January 1st of the current year
    const endOfYear = new Date(currentYear + 1, 0, 0); // January 1st of the next year

    // Query to find products sold within the current year and sort by 'sold' in descending order
    const topProducts = await Product.find({
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    })
      .sort({ sold: -1 })
      .limit(10);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  exportProduct,
  getTopProducts,
  getProductByIdCategory,
};

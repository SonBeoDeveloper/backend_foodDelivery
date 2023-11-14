const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const validateMongodbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");
const { generateRefreshToken } = require("../config/refreshToken");
const sendEmail = require("./emailCtrl");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
var uniqid = require("uniqid");
const Coupon = require("../models/couponModel");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const HistoryCart = require("../models/HistoryCartModel");
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User already exists");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("token", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      status: true,
      _id: findUser?._id,
      fullname: findUser?.fullname,
      email: findUser?.email,
      phone: findUser?.phone,
      data: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});
const loginAdminCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role != "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const token = await generateRefreshToken(findAdmin?.id);
    const updateAdmin = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        token: token,
      },
      {
        new: true,
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      status: true,
      fullname: findAdmin?.fullname,
      email: findAdmin?.email,
      phone: findAdmin?.phone,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json({ data: getUsers, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        fullname: req?.body?.fullname,
        email: req?.body?.email,
        phone: req?.body?.phone,
      },
      {
        new: true,
      }
    );

    res.json({ data: updatedUser, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const getaUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);

  try {
    const getaUser = await User.findById(_id).populate("wishList");
    res.json({ data: getaUser, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (error) {
    throw new Error(error);
  }
});
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const block = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json(block);
  } catch (error) {
    throw new Error(error);
  }
});
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json({ message: "User unblocked" });
  } catch (error) {
    throw new Error(error);
  }
});
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.token) throw new Error("No Refresh token in Cookies");
  const token = cookie.token;
  const user = await User.findOne({ refreshToken: token });
  if (!user) throw new Error("No fresh Token present in db or not matched");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There are something wrong refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ data: accessToken, status: true });
  });
});
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.token) throw new Error("No Refresh Token in Cookies");
  const token = cookie.token;
  const user = await User.findOne({ token });
  if (!user) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(
    { token },
    {
      token: "",
    }
  );
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});
const checkUserExist = asyncHandler(async (query) => {
  let messages = {
    phone: "Phone already exist",
    email: "This email is taken",
  };
  try {
    let queryType = Object.keys(query)[0];
    let userObject = await User.findOne(query);
    return !userObject
      ? { status: true, message: `This ${queryType} is not taken` }
      : { status: false, message: messages[queryType] };
  } catch (error) {
    throw new Error(error);
  }
});
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword);
  } else {
    res.json(user);
  }
});
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token expired, please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});
const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishList");
    res.json({ data: findUser, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const saveAddress = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json({ data: saveAddress, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;

  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let Object = {};
      Object.product = cart[i]._id;
      Object.count = cart[i].count;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      Object.price = getPrice.price;
      products.push(Object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderBy: user?._id,
    }).save();
    res.json({ data: newCart, status: true });
  } catch (error) {
    console.error("Error in userCart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { id } = req.user;

  validateMongodbId(id);
  try {
    const cart = await Cart.findOne({ orderBy: id })
      .populate("products.product")
      .populate("orderBy");
    // Thay đổi cách gửi JSON response
    res.json({ data: cart, status: true });
  } catch (error) {
    throw new Error(error);
  }
});

// Controller để thêm sản phẩm vào giỏ hàng
const addToCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const { productId } = req.body;

  try {
    // Tìm giỏ hàng của người dùng dựa trên _id
    let cart = await Cart.findOne({ orderBy: _id });

    if (!cart) {
      // Nếu người dùng chưa có giỏ hàng, tạo một giỏ hàng mới
      cart = new Cart({ orderBy: _id, products: [] });
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productId
    );
    console.log(existingProduct);
    if (existingProduct) {
      // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng lên 1
      existingProduct.count += 1;
    } else {
      // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm nó vào giỏ hàng với số lượng là 1
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ error: "Sản phẩm không tồn tại" });
      }
      cart.products.push({
        product: productId,
        count: 1,
        price: product.price,
      });
    }

    // Tính lại tổng giá trị của giỏ hàng
    cart.cartTotal = cart.products.reduce(
      (total, item) => total + item.count * item.price,
      0
    );

    await cart.save();
    res.status(200).json({
      message: "Sản phẩm đã được thêm vào giỏ hàng",
      data: cart,
      status: true,
    });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi khi thêm sản phẩm vào giỏ hàng" });
  }
});
const removeCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const { productId } = req.body; // ID của sản phẩm cần xóa

  try {
    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ orderBy: _id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Tìm sản phẩm trong giỏ hàng
    const productIndex = cart.products.findIndex(
      (product) => product.product == productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const productInCart = cart.products[productIndex];

    if (productInCart.count === 1) {
      // Nếu số lượng sản phẩm trong giỏ hàng = 1, loại bỏ nó
      cart.products.splice(productIndex, 1);
    } else {
      // Giảm số lượng sản phẩm đi 1
      cart.products[productIndex].count -= 1;
    }

    // Cập nhật lại giá trị itemTotals và Totals
    // Việc này phụ thuộc vào cách bạn tính toán giá trị trong giỏ hàng
    let newCartTotal = 0;
    for (const product of cart.products) {
      newCartTotal += product.count * product.price;
    }

    // Cập nhật giá trị mới cho cartTotal
    cart.cartTotal = newCartTotal;
    // Lưu lại giỏ hàng đã cập nhật
    await cart.save();

    return res
      .status(200)
      .json({ message: "Product removed from cart", data: cart, status: true });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderBy: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});
const saveHistoryCart = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findOne({ _id });

    const currentCart = await Cart.findOne({ orderBy: user._id }).populate(
      "products.product"
    );

    if (!currentCart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }
    const historyCart = new HistoryCart({
      userId: _id,
      cart: currentCart.products,
    });

    await historyCart.save();
    await Cart.findOneAndRemove({ orderBy: user._id });

    res.status(200).json({
      message: "Lịch sử giỏ hàng đã được lưu.",
      data: historyCart,
      status: true,
    });
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
const getHistory = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user; // Thay thế bằng cách lấy thông tin người dùng từ request
    const historyCarts = await HistoryCart.find({ userId: _id }).populate({
      path: "cart",
      populate: {
        path: "product",
        model: "Product",
        select: "name images", // Include the fields you want
      },
    });

    res.status(200).json({ data: historyCarts, status: true });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
const getAllHistory = asyncHandler(async (req, res) => {
  try {
    const getallhistory = await HistoryCart.find()
      .populate("userId")
      .populate("cart");
    res.json({ data: getallhistory, status: true });
  } catch (error) {
    throw new Error(error);
  }
});
const applyCoupon = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { _id } = req.user;

  validateMongodbId(_id);
  const validCoupon = await Coupon.findOne({ name });
  console.log(validCoupon);
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderBy: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderBy: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});
const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderBy: user._id });
    let finalAmout = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }

    const newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Cash On Delivery",
        created: Date.now(),
        currency: "VNĐ",
      },
      orderBy: user._id,
      orderStatus: "Cash on Delivery",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ data: newOrder });
  } catch (error) {
    throw new Error(error);
  }
});
const getOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const userorder = await Order.findOne({ orderBy: _id })
      .populate("products")
      .populate("orderBy")
      .exec();
    res.json(userorder);
  } catch (error) {
    throw new Error(error);
  }
});
const getAllOrder = asyncHandler(async (req, res) => {
  try {
    const getAll = await Order.find().populate("orderBy", "fullname phone");
    res.json(getAll);
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  validateMongodbId(id);
  try {
    const findOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      {
        new: true,
      }
    );
    res.json(findOrder);
  } catch (error) {
    throw new Error(error);
  }
});
const getOrderByUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch orders for the user
    const userOrders = await Order.find({ orderBy: id })
      .populate("products")
      .populate("orderBy", "fullname")
      .populate("paymentIntent");

    if (userOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for the user." });
    }
    const formattedOrders = userOrders.map((order) => {
      const formattedProducts = order.products.map((product) => {
        // Assuming Product model has a 'name' field
        return {
          name: product.product,
          count: product.count,
        };
      });

      return {
        orderId: order._id,
        orderStatus: order.orderStatus,
        products: formattedProducts,
        orderBy: order.orderBy,
        paymentIntent: order.paymentIntent,
        createdAt: order.createdAt,
        // Add other fields as needed
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
const deleteOrderByUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.find({ orderBy: id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    await order.remove();
    res.json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = {
  createUser,
  loginUserCtrl,
  getOrder,
  emptyCart,
  updateOrderStatus,
  addToCart,
  logout,
  deleteOrderByUser,
  applyCoupon,
  forgotPasswordToken,
  getUserCart,
  createOrder,
  getAllUser,
  saveAddress,
  resetPassword,
  getWishlist,
  getaUser,
  deleteUser,
  updatePassword,
  updatedUser,
  checkUserExist,
  blockUser,
  getAllHistory,
  unblockUser,
  handleRefreshToken,
  loginAdminCtrl,
  userCart,
  getHistory,
  saveHistoryCart,
  removeCart,
  getAllOrder,
  getOrderByUser,
};

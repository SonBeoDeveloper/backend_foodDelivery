const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      res.status(401).json({
        message:
          "Not Authorized: Token expired or invalid. Please login again.",
      });
    }
  } else {
    res
      .status(401)
      .json({ message: "Not Authorized: No token attached to the header." });
  }
});
const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role === "admin" || user.role === "employee") {
    next();
  } else {
    throw new Error("You are not authorized");
  }
});
module.exports = { authMiddleware, isAdmin };

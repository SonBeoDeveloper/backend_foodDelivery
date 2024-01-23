const express = require("express");
const session = require("express-session");
const dbConnect = require("./config/dbConnect");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const app = express();
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoute");
const reset = require("./routes/reset");
const bodyParser = require("body-parser");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/categoryRouter");
const couponRoute = require("./routes/couponRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandle");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Cấu hình session
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

dotenv.config();
const morgan = require("morgan");
const PORT = process.env.PORT || 4000;
app.use(cors());
dbConnect();
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "199746055448-cvq9lt2ktq4s22qpn8tnr9hbcckc53mv.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // Hành động sau khi xác thực thành công
      console.log("Authenticated:", profile);
      return done(null, profile);
    }
  )
);

app.use(passport.initialize());

// Đường dẫn để bắt đầu đăng nhập
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback URL từ Google sau khi đăng nhập thành công
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Redirect hoặc xử lý khi đăng nhập thành công
    res.redirect("/");
  }
);

// Middleware kiểm tra đăng nhập
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/google");
}

// Đường dẫn chỉ dành cho người dùng đã đăng nhập
app.get("/", isLoggedIn, (req, res) => {
  res.send("Hello, authenticated user!");
});

app.use("/user", authRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);
app.use("/coupon", couponRoute);
app.use("/twilio-verify", reset);
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`server is running at PORT ${PORT}`);
});

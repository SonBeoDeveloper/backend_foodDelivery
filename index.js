const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();

const dotenv = require("dotenv");
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/categoryRouter");
const couponRoute = require("./routes/couponRoute");
const { notFound, errorHandler } = require("./middlewares/errorHandle");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();
const morgan = require("morgan");
const PORT = process.env.PORT || 4000;
app.use(cors());
dbConnect();
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/user", authRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);
app.use("/coupon", couponRoute);
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`server is running at PORT ${PORT}`);
});

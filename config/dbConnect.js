const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connected error");
  }
};
module.exports = dbConnect;

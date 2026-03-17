const { default: mongoose } = require("mongoose");

const connectDB = async (req, res) => {
  try {
    await mongoose.connect("mongodb://localhost:27017/yumaris");
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

module.exports = connectDB;

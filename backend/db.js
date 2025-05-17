// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "eazepark", // optional if specified in URI
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("🔥 MongoDB connection failed:", error);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;

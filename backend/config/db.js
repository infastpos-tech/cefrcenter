// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("📡 MongoDB ga ulanmoqda...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB ulandi: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB xatosi:", err.message);
    process.exit(1);
  }
};

export default connectDB;
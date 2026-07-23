import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  type:     { type: String, default: "info" }, // update, tip, feature, streak, info
  icon:     { type: String, default: "bell" },
  date:     { type: String, default: () => new Date().toISOString().split('T')[0] },
  pinned:   { type: Boolean, default: false },
  image:    { type: String, default: "" }, // Base64 or URL
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  author: { type: String, required: true }, // Username or Email
  authorEmail: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ["Essay", "Email", "Letter", "Speaking", "Vocabulary", "Other"], default: "Essay" },
  likes: { type: Array, default: [] }, // Array of user emails
  views: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

communitySchema.index({ aiApproved: 1, date: -1 });

const Community = mongoose.model("Community", communitySchema);
export default Community;

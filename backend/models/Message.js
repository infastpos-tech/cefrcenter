import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  title: { type: String, required: true },
  body:  { type: String, required: true },
  type:  { type: String, enum: ['success', 'error', 'info'], default: 'info' },
  read:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ email: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;

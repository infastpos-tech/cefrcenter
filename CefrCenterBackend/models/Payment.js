import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true }, // good to keep for fast query/linking
  planId: { type: String, required: true },
  paymentMethod: { type: String, required: true, enum: ['click', 'payme', 'uzum', 'paynet'] },
  amount: { type: Number, required: true },
  phone: { type: String, required: true },
  comment: { type: String, default: "" },
  receiptFileUrl: { type: String, required: true },
  receiptStoragePath: { type: String, default: "" },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: null }
});

paymentSchema.index({ email: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;

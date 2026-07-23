import express from "express";
import multer from "multer";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { uploadToSupabase } from "../services/supabaseStorage.js";
// The receipt image is stored in Supabase and only the URL/path is saved in MongoDB.

const router = express.Router();

// Multer storage config using memory for Base64 saving
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Middleware to check admin using email
export async function adminAuth(req, res, next) {
  const email = req.headers['x-user-email'] || req.query.email || req.body.email;
  if (!email) return res.status(401).json({ error: "Unauthorized: No email provided" });
  try {
    if (email === "xojiakbar@admin.com" || email === "xolmirzayevanargiza57@gmail.com") {
        req.adminUser = { email, isAdmin: true };
        return next();
    }
    const user = await User.findOne({ email });
    if (!user || (user.isAdmin !== true && user.email !== "xolmirzayevanargiza57@gmail.com")) {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth verification failed" });
  }
}

// @route   POST /api/payments/submit
// @desc    Upload receipt and create payment request
// @access  Public (Authenticated users only via frontend)
router.post("/submit", upload.single("receipt"), async (req, res) => {
  try {
    const { email, amount, username, phone: userPhone, comment } = req.body;
    let { userId, planId, paymentMethod } = req.body;
    
    if (!req.file) return res.status(400).json({ error: "Receipt image is required" });
    if (!email) return res.status(400).json({ error: "Email missing" });

    const uploadResult = await uploadToSupabase(req.file.buffer, req.file.originalname || "receipt.jpg", "receipts");
    const receiptUrl = uploadResult.publicUrl;
    const receiptStoragePath = uploadResult.objectPath;
    
    // Provide defaults
    userId = userId || email;
    planId = planId || "Premium Plan";
    paymentMethod = paymentMethod || "click";
    const phone = userPhone || "Unknown";

    const payment = new Payment({
      userId,
      email,
      username: username || email.split('@')[0],
      planId,
      paymentMethod,
      amount: Number(amount) || 0,
      phone,
      comment: comment || "",
      receiptFileUrl: receiptUrl,
      receiptStoragePath
    });
    
    await payment.save();
    res.status(201).json({ message: "Payment request submitted successfully", paymentId: payment._id });
  } catch (err) {
    console.error("Payment submit error:", err);
    res.status(500).json({ error: err.message || "Failed to submit payment request" });
  }
});

// @route   GET /api/payments/admin/list
// @desc    Get all payments
// @access  Admin
router.get("/admin/list", adminAuth, async (req, res) => {
  try {
    const statusFilter = req.query.status;
    let query = {};
    if (statusFilter) query.status = statusFilter;
    
    const payments = await Payment.find(query).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to load payments" });
  }
});

// @route   POST /api/payments/admin/:id/approve
// @desc    Approve a payment and grant premium
// @access  Admin
router.post("/admin/:id/approve", adminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "pending") return res.status(400).json({ error: "Payment is already processed" });

    const user = await User.findOne({ email: payment.email });
    if (!user) return res.status(404).json({ error: "User linked to payment not found" });

    payment.status = "approved";
    payment.approvedAt = new Date();
    payment.receiptFileUrl = "[Receipt Verified]";
    await payment.save();

    let days = 30;
    if (payment.planId.includes("days")) {
      const parsed = parseInt(payment.planId.replace(/[^0-9]/g, ''));
      if (!isNaN(parsed)) days = parsed;
    }

    const now = new Date();
    let expireDate = new Date();
    if (user.isPremium && user.premiumExpire && new Date(user.premiumExpire) > now) {
      expireDate = new Date(user.premiumExpire);
    }
    expireDate.setDate(expireDate.getDate() + days);

    user.isPremium = true;
    user.premiumPlan = payment.planId;
    user.premiumStart = user.premiumStart || now;
    user.premiumExpire = expireDate;
    await user.save();

    const msg = await Message.create({
      email: user.email,
      title: "Premium Approved 🚀",
      body: `Your payment for ${days} days of premium has been approved! Enjoy full access!`,
      type: "success"
    });

    try {
      const io = req.app.get('io');
      if (io) io.emit('new_message', { email: user.email, message: msg });
    } catch (e) { console.warn('Socket emit failed', e); }

    res.json({ message: "Payment approved and premium granted", expireDate, payment });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ error: "Failed to approve payment" });
  }
});

// @route   POST /api/payments/admin/:id/reject
// @desc    Reject a payment
// @access  Admin
router.post("/admin/:id/reject", adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    payment.status = "rejected";
    payment.rejectionReason = reason || "Unspecified reason";
    await payment.save();

    const msg = await Message.create({
      email: payment.email,
      title: "Premium Payment Rejected ❌",
      body: `Your payment request was rejected. Reason:\n${payment.rejectionReason}`,
      type: "error"
    });

    try {
      const io = req.app.get('io');
      if (io) io.emit('new_message', { email: payment.email, message: msg });
    } catch (e) { console.warn('Socket emit failed', e); }

    res.json({ message: "Payment rejected and user notified", payment });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject payment" });
  }
});

// @route   POST /api/payments/admin/user/:email/remove-premium
// @desc    Manually remove premium from a user with a reason
// @access  Admin
router.post("/admin/user/:email/remove-premium", adminAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const { reason } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isPremium = false;
    user.premiumPlan = null;
    user.premiumExpire = null;
    await user.save();

    await Message.create({
      email: user.email,
      title: "Premium Access Revoked ⚠️",
      body: `Your premium access has been removed by the administrator. \nReason: ${reason || "Policy violation or administrative action."}`,
      type: "info"
    });

    res.json({ message: "Premium status removed and user notified." });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove premium" });
  }
});

// @route   DELETE /api/payments/admin/:id
// @desc    Delete a payment record
// @access  Admin
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

// @route   POST /api/payments/admin/cleanup
// @desc    Remove premium status from expired users
// @access  Admin
router.post("/admin/cleanup", adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const result = await User.updateMany(
      { isPremium: true, premiumExpire: { $lt: now } },
      { $set: { isPremium: false, premiumPlan: null } }
    );
    res.json({ message: `Successfully removed expired premium from ${result.modifiedCount} users.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to cleanup expired premium users" });
  }
});

// @route   GET /api/payments/admin/users
// @desc    List users with premium fields
// @access  Admin
router.get("/admin/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select("-scores -vocabulary -activityLog -_scoreTimestamps").sort({ lastUpdated: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;

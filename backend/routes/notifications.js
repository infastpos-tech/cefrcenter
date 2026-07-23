import express from "express";
import multer from "multer";
import Notification from "../models/Notification.js";
import { adminAuth } from "./payments.js";
import { uploadToSupabase } from "../services/supabaseStorage.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET all notifications
router.get("/", async (req, res) => {
  try {
    const notifs = await Notification.find({}).sort({ createdAt: -1 }).lean();
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new notification with optional upload
router.post("/", adminAuth, upload.single("imageFile"), async (req, res) => {
  try {
    const { title, message, type, icon, pinned, imageUrl } = req.body;
    let finalImage = imageUrl || "";

    if (req.file) {
      const uploadResult = await uploadToSupabase(req.file.buffer, req.file.originalname || "notification.jpg", "notifications");
      finalImage = uploadResult.publicUrl;
    }

    const newNotif = new Notification({
      title,
      message,
      type: type || "info",
      icon: icon || "bell",
      pinned: !!pinned,
      image: finalImage
    });
    await newNotif.save();

    // Broadcast to all connected clients
    try {
      const io = req.app.get('io');
      if (io) io.emit('notification_created', newNotif);
    } catch (e) { console.warn('Socket broadcast failed', e); }

    res.status(201).json(newNotif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE notification
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// POST /api/telegram/sync - Sync or login user from Telegram WebApp
router.post("/sync", async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, photoUrl } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: "telegramId talab qilinadi" });
    }

    const email = `tg_${telegramId}@telegram.cefr`;
    const tgUsername = username || `user_${telegramId}`;
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || tgUsername;

    if (!isDbConnected()) {
      return res.json({
        success: true,
        user: {
          email,
          username: tgUsername,
          displayName,
          photoURL: photoUrl || "",
          telegramId,
          _offline: true
        }
      });
    }

    let existingUser = await User.findOne({ $or: [{ telegramId: String(telegramId) }, { email }] });
    const isNewUser = !existingUser;

    const trialExpire = new Date();
    trialExpire.setDate(trialExpire.getDate() + 19);

    const updateFields = {
      telegramId: String(telegramId),
      username: tgUsername,
      photoURL: photoUrl || (existingUser?.photoURL || ""),
      lastUpdated: new Date()
    };

    if (isNewUser) {
      updateFields.email = email;
      updateFields.isPremium = true;
      updateFields.premiumExpire = trialExpire;
      updateFields.premiumPlan = "19-Day Telegram Trial";
      updateFields.xp = 0;
      updateFields.level = "A1";
    }

    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ telegramId: String(telegramId) }, { email }] },
      { $set: updateFields, $setOnInsert: { email } },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    res.json({
      success: true,
      isNewUser,
      user: updatedUser
    });
  } catch (err) {
    console.error("Telegram user sync error:", err.message);
    res.status(500).json({ error: "Telegram sinxronizatsiyasida xatolik: " + err.message });
  }
});

export default router;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import TelegramBot from "node-telegram-bot-api";
import { loadLessonsData } from "./lessons.js";

import vocabularyRouter from "./routes/vocabulary.js";
import aiRouter from "./routes/ai.js";
import listeningRouter from "./routes/listening.js";
import readingRouter from "./routes/reading.js";
import writingRouter from "./routes/writing.js";
import speakingRouter from "./routes/speaking.js";
import telegramRouter from "./routes/telegram.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8808000418:AAF97acdkXRC0gsKpLZaTav8D5mi9fpdwVU";
const WEBAPP_URL = process.env.TELEGRAM_WEBAPP_URL || "https://xolmirzayevanargiza57-crypto.github.io/Cefr/";

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ── In-Memory Lessons Cache ──
let lessonsCache = null;
const reloadLessons = () => {
  try {
    lessonsCache = loadLessonsData();
    console.log("📁 CEFR Lessons (Listening, Reading, Writing, Speaking) muvaffaqiyatli yuklandi!");
  } catch (e) {
    console.error("❌ Lessons data yuklanishda xatolik:", e.message);
  }
};
reloadLessons();

// ── Health API ──
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    botStatus: BOT_TOKEN ? "active" : "disabled",
    webAppUrl: WEBAPP_URL,
    lessonsLoaded: !!lessonsCache,
    listeningCount: lessonsCache?.LISTENING_TESTS?.length || 0,
    readingCount: lessonsCache?.READING_TESTS?.length || 0,
    writingCount: lessonsCache?.WRITING_TESTS?.length || 0,
    speakingCount: lessonsCache?.SPEAKING_TESTS?.length || 0,
    time: new Date().toISOString()
  });
});

// ── Lessons & Test Endpoints ──
app.get("/api/lessons", (_req, res) => {
  if (!lessonsCache) reloadLessons();
  res.json(lessonsCache || {});
});

app.use("/api/vocabulary", vocabularyRouter);
app.use("/api/ai", aiRouter);
app.use("/api/listening", listeningRouter);
app.use("/api/reading", readingRouter);
app.use("/api/writing", writingRouter);
app.use("/api/speaking", speakingRouter);
app.use("/api/telegram", telegramRouter);

// ── User Progress Endpoint ──
const usersStore = new Map();

app.get("/api/user/progress", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email talab qilinadi" });

  const existing = usersStore.get(email);
  if (existing) {
    return res.json(existing);
  }
  res.json({ newUser: true });
});

app.post("/api/user/progress", (req, res) => {
  const { email, ...data } = req.body;
  if (!email) return res.status(400).json({ error: "Email talab qilinadi" });

  const existing = usersStore.get(email) || { email, xp: 0, level: "A1", isPremium: true };
  const updated = { ...existing, ...data, lastUpdated: new Date().toISOString() };
  usersStore.set(email, updated);

  res.json({ success: true, user: updated });
});

// ── Leaderboard Endpoint ──
app.get("/api/leaderboard", (_req, res) => {
  const users = Array.from(usersStore.values()).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  res.json({ users, userRank: 1 });
});

// ── Initialize Telegram Bot ──
let bot = null;

if (BOT_TOKEN) {
  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log("\n✅ 🤖 Telegram Bot polling rejimida ishga tushdi!");
    console.log(`🔗 Mini App URL: ${WEBAPP_URL}\n`);

    // /start command
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || "Foydalanuvchi";

      const welcomeText = 
`👋 **Salom, ${firstName}! CEFR Center-ga xush kelibsiz!** 🎓

**CEFR Center** — O'zbekistondagi eng ilg'or AI-asosli CEFR imtihon simulyatori!

📱 **Telegram Mini App orqali Barcha Testlar:**
• 🎧 **Listening** testlari (Part 1-6)
• 📖 **Reading** mashqlari (Part 1-5)
• ✍️ **Writing** insho va tavsiflar (AI baxo)
• 🗣️ **Speaking** AI suhbatdoshi va savollari
• 🏆 Peshqadamlar jadvali

Pastdagi tugmani bosing va Mini App-ni oching! 👇`;

      bot.sendMessage(chatId, welcomeText, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 CEFR Center-ni Ochish (Mini App)",
                web_app: { url: WEBAPP_URL }
              }
            ],
            [
              { text: "ℹ️ Yordam & Yo'riqnoma", callback_data: "help_info" },
              { text: "🌐 Veb-sayt", url: WEBAPP_URL }
            ]
          ]
        }
      });
    });

    // /help, /app, /test commands
    bot.onText(/\/(help|app|test)/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, `🚀 CEFR Center testlarini boshlash uchun pastdagi tugmani bosing:`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚡️ Launch CEFR Mini App", web_app: { url: WEBAPP_URL } }]
          ]
        }
      });
    });

    bot.on("callback_query", (query) => {
      const chatId = query.message?.chat?.id;
      if (chatId && query.data === "help_info") {
        bot.sendMessage(chatId, 
`ℹ️ **CEFR Center Yo'riqnomasi:**
1. Mini App tugmasini bosing.
2. Telegram yoki Google orqali tizimga kiring.
3. Testlar bo'limidan Listening, Reading, Writing yoki Speaking testini tanlang!

Qo'llab-quvvatlash: @CefrCenterSupport`, { parse_mode: "Markdown" });
      }
      try {
        bot.answerCallbackQuery(query.id);
      } catch (e) {}
    });

    bot.on("polling_error", (error) => {
      if (!error.message?.includes("EFATAL")) {
        console.warn("⚠️ Telegram Bot polling:", error.message);
      }
    });

  } catch (err) {
    console.error("❌ Telegram Bot yaratishda xatolik:", err.message);
  }
}

// ── Start Express Server ──
app.listen(PORT, () => {
  console.log(`🚀 Bekkend server http://localhost:${PORT} portida va barcha Listening/Reading/Writing/Speaking testlari bilan ishlamoqda.`);
});

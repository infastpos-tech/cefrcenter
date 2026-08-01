import express    from "express";
import http       from "http";
import { Server } from "socket.io";
import cors       from "cors";
import dotenv     from "dotenv";
import mongoose   from "mongoose";
import helmet     from "helmet";
import compression from "compression";
import fs         from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadLessonsData, saveLessonsData } from "./lessons.js";
import vocabularyRouter from "./routes/vocabulary.js";
import aiRouter from "./routes/ai.js";
import notificationRouter from "./routes/notifications.js";
import communityRouter from "./routes/community.js";
import paymentsRouter from "./routes/payments.js";
import messagesRouter from "./routes/messages.js";
import writingRouter from "./routes/writing.js";
import speakingRouter from "./routes/speaking.js";
import readingRouter from "./routes/reading.js";
import listeningRouter from "./routes/listening.js";
import telegramRouter from "./routes/telegram.js";
import { initTelegramBot } from "./services/telegramBot.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname);
const lessonsPath = path.join(BACKEND_ROOT, "lessons.json");

const app  = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    /\.vercel\.app$/,
  ],
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });
// expose io to routes via app locals
app.set('io', io);

// ── Optimization Middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ── In-Memory Cache ─────────────────────────────────────────────────────────
let lessonsCache = null;
const loadLessons = () => {
  try {
    lessonsCache = loadLessonsData();
    console.log("📁 Lessons cache loaded from lessons.js.");
  } catch (e) {
    console.error("❌ Failed to load lessons data:", e.message);
  }
};
loadLessons();

// Watch for changes to lessons.json specifically to reload cache
fs.watch(lessonsPath, (event) => {
  if (event === 'change') {
    console.log("♻️ lessons.json changed, reloading cache...");
    loadLessons();
  }
});

// ── MongoDB connection (retry logic 24/7) ────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️  MONGO_URI is missing — running in FILE-ONLY mode (lessons, vocabulary & AI routes work; user auth disabled).");
}

const connectDB = async () => {
  try {
    console.log("📡 Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Wait 30s to find primary
      socketTimeoutMS: 45000,
      family: 4,                      // Force IPv4 for stability
      heartbeatFrequencyMS: 1000,     // Check connection every 1s
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Failed: ${err.message}`);
    if (err.message.includes("selection timed out")) {
      console.error("👉 TIP: This usually means your IP is not whitelisted in MongoDB Atlas or port 27017 is blocked.");
    }
    console.log("⏳ Retrying in 10 seconds...");
    setTimeout(connectDB, 10000);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected. Reconnecting...");
  setTimeout(connectDB, 5000);
});
mongoose.connection.on("error", (err) => {
  console.error("⚠️ MongoDB Error:", err);
});

// ── Routes ────────────────────────────────────────────────────────────────────
import User from "./models/User.js";

app.get("/api/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    db:     states[mongoose.connection.readyState] ?? "unknown",
    uptime: Math.floor(process.uptime()) + "s",
    time:   new Date().toISOString(),
  });
});

app.use("/api/vocabulary", vocabularyRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/community", communityRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/writing", writingRouter);
app.use("/api/speaking", speakingRouter);
app.use("/api/reading", readingRouter);
app.use("/api/listening", listeningRouter);
app.use("/api/telegram", telegramRouter);

// Helper to check DB readiness
const isDbConnected = () => mongoose.connection.readyState === 1;

// Missing routes implementation
app.get("/api/user/progress", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    if (!isDbConnected()) {
      return res.json({ newUser: true, _offline: true });
    }

    let user = await User.findOne({ email }).lean();
    if (!user) return res.json({ newUser: true });

    // Premium expiration check
    if (user.isPremium && user.premiumExpire && new Date(user.premiumExpire) < new Date()) {
      await User.updateOne({ email }, { $set: { isPremium: false } });
      user.isPremium = false;
    }

    res.json(user);
  } catch (err) {
    res.json({ newUser: true, _offline: true });
  }
});

app.post("/api/user/progress", async (req, res) => {
  try {
    const { email, photoURL, ...data } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    
    if (!isDbConnected()) {
      return res.json({ success: true, isNewUser: false, _offline: true });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    const isNewUser = !existingUser;

    const update = { ...data };
    if (photoURL) update.photoURL = photoURL;
    update.lastUpdated = new Date(); // Update activity timestamp

    // Grant 19 days of premium for new users (Trial)
    if (isNewUser) {
      const trialExpire = new Date();
      trialExpire.setDate(trialExpire.getDate() + 19);
      update.isPremium = true;
      update.premiumExpire = trialExpire;
      update.premiumPlan = "19-Day Trial";
    }

    const isAdminEmail = email === "asatillo@admin.com" || email === "xolmirzayevanargiza57@gmail.com";
    if (isAdminEmail) update.isAdmin = true;

    await User.findOneAndUpdate(
      { email },
      { $set: update, $setOnInsert: { email } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true, isNewUser });
  } catch (err) {
    res.json({ success: true, _offline: true });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const { email, sort: sortType } = req.query;

    if (!isDbConnected()) {
      return res.json({ users: [], userRank: -1, _offline: true });
    }

    const sort = sortType === "streak" ? { consecutiveDays: -1 } : { xp: -1 };
    
    // Get top 50
    const users = await User.find({ isHidden: { $ne: true } }, 'email xp consecutiveDays level username bio telegram instagram photoURL')
      .sort(sort)
      .limit(50)
      .lean();

    const topUsers = users.map(u => ({ 
      ...u, 
      username: u.username || (u.email ? u.email.split('@')[0] : "Anonymous") 
    }));

    // Calculate rank for the requesting user
    let userRank = -1;
    if (email) {
      const currentUser = await User.findOne({ email }, 'xp');
      if (currentUser) {
        userRank = await User.countDocuments({ xp: { $gt: currentUser.xp } }) + 1;
      }
    }

    res.json({ 
      users: topUsers,
      userRank
    });
  } catch (err) {
    console.error("Leaderboard API error:", err.message);
    res.json({ users: [], userRank: -1, _offline: true });
  }
});

// ── Section-specific leaderboard ──────────────────────────────────────────────
app.get("/api/leaderboard/section", async (req, res) => {
  try {
    const { section = "listening", email } = req.query;

    if (!isDbConnected()) {
      return res.json({ top3: [], myRank: null, total: 0, _offline: true });
    }

    const prefix = section; // "listening", "reading", "writing", "speaking"

    const users = await User.find({ isHidden: { $ne: true }, scores: { $exists: true } },
      'email xp level username photoURL scores consecutiveDays'
    ).lean();

    // Calculate best score for each user in this section
    const ranked = users
      .map(u => {
        const sectionScores = Object.entries(u.scores || {})
          .filter(([k]) => k.startsWith(prefix) && k.includes("overall"))
          .map(([, v]) => Number(v) || 0);
        const bestScore = sectionScores.length > 0 ? Math.max(...sectionScores) : 0;
        return {
          email: u.email,
          username: u.username || (u.email ? u.email.split('@')[0] : "User"),
          photoURL: u.photoURL || "",
          level: u.level || "A1",
          xp: u.xp || 0,
          sectionScore: bestScore,
          attempts: sectionScores.length,
        };
      })
      .filter(u => u.sectionScore > 0)
      .sort((a, b) => b.sectionScore - a.sectionScore);

    const top3 = ranked.slice(0, 3);

    let myRank = null;
    if (email) {
      const idx = ranked.findIndex(u => u.email === email);
      myRank = idx !== -1 ? idx + 1 : null;
    }

    res.json({ top3, myRank, total: ranked.length });
  } catch (err) {
    console.error("Section leaderboard error:", err.message);
    res.json({ top3: [], myRank: null, total: 0, _offline: true });
  }
});

app.get("/api/admin/security", async (req, res) => {
  const { email } = req.query;
  if (!email || (email !== "asatillo@admin.com" && email !== "xolmirzayevanargiza57@gmail.com")) {
    return res.status(403).json({ error: "Forbidden" });
  }
  // Return dummy or stored security data
  res.json({
    otpCode: "887766",
    faceIdToken: "encrypted_default_token"
  });
});

app.post("/api/admin/security/update", async (req, res) => {
  const { email, otpCode, faceIdToken } = req.body;
  if (!email || (email !== "asatillo@admin.com" && email !== "xolmirzayevanargiza57@gmail.com")) {
    return res.status(403).json({ error: "Forbidden" });
  }
  // For now, just success log
  console.log(`Security update by ${email}: OTP=${otpCode}`);
  res.json({ success: true });
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    if (!isDbConnected()) {
      return res.json({
        totalUsers: 0,
        recentUsers: 0,
        dbStatus: states[mongoose.connection.readyState] || "disconnected",
        uptime: Math.floor(process.uptime()),
        _offline: true
      });
    }

    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({ lastUpdated: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    
    res.json({
      totalUsers,
      recentUsers,
      dbStatus: states[mongoose.connection.readyState],
      uptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    res.json({
      totalUsers: 0,
      recentUsers: 0,
      dbStatus: "disconnected",
      uptime: Math.floor(process.uptime()),
      _offline: true
    });
  }
});

app.get("/api/auth/check-username", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username required" });

    if (!isDbConnected()) {
      return res.json({ available: true, _offline: true });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (!existing) {
      return res.json({ available: true });
    }

    // Generate suggestions
    const suggestions = [];
    for (let i = 0; i < 3; i++) {
      const suggest = username.toLowerCase() + Math.floor(Math.random() * 9999);
      const isTaken = await User.findOne({ username: suggest });
      if (!isTaken) suggestions.push(suggest);
    }

    res.json({ available: false, suggestions });
  } catch (err) {
    res.json({ available: true, _offline: true });
  }
});

// Soft refresh trigger
app.get("/api/lessons", async (req, res) => {
  if (lessonsCache) {
    return res.json(lessonsCache);
  }
  try {
    const data = loadLessonsData();
    lessonsCache = data;
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: "lessons data not found" });
  }
});

app.get("/api/admin/lessons", async (req, res) => {
  try {
    const data = loadLessonsData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/add-lesson", async (req, res) => {
  try {
    const { type, lesson } = req.body;
    if (!type || !lesson) return res.status(400).json({ error: "Missing type or lesson data" });

    const data = loadLessonsData();
    const key = type === "listening" ? "LISTENING_TESTS" : (type === "reading" ? "READING_TESTS" : (type === "writing" ? "WRITING_TESTS" : "SPEAKING_TESTS"));
    
    if (!data[key]) data[key] = [];
    
    // Check if a lesson with this title already exists in this category
    const existingIndex = data[key].findIndex(l => l.title === lesson.title);

    if (existingIndex !== -1) {
      // MERGE: Add new parts to existing lesson
      if (!data[key][existingIndex].parts) data[key][existingIndex].parts = [];
      
      // Prevent duplicate parts by checking ID
      const newPart = lesson.parts[0];
      const partIndex = data[key][existingIndex].parts.findIndex(p => p.id === newPart.id);
      
      if (partIndex !== -1) {
        data[key][existingIndex].parts[partIndex] = newPart; // Update existing part
      } else {
        data[key][existingIndex].parts.push(newPart); // Add new part
      }
      
      // Sort parts by ID for consistency
      data[key][existingIndex].parts.sort((a, b) => a.id - b.id);
    } else {
      // CREATE NEW: Auto-increment lesson ID
      const maxId = data[key].reduce((max, item) => Math.max(max, item.id || 0), 0);
      lesson.id = maxId + 1;
      data[key].push(lesson);
    }
    
    saveLessonsData(data);
    lessonsCache = data; // Update cache
    
    res.json({ success: true, lesson: existingIndex !== -1 ? data[key][existingIndex] : lesson });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/lessons/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const data = loadLessonsData();
    const key = type.toUpperCase() + "_TESTS";
    
    if (data[key]) {
      data[key] = data[key].filter(l => l.id !== parseInt(id));
      saveLessonsData(data);
      lessonsCache = data;
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Type not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/add-vocab", async (req, res) => {
  try {
    const { word, definition, sentence, uz } = req.body;
    if (!word) return res.status(400).json({ error: "Word is required" });

    let vocabData = [];
    try {
      vocabData = JSON.parse(fs.readFileSync('./vocabulary.json', 'utf8'));
    } catch (e) { vocabData = []; }

    const newItem = { 
      word, 
      definition, 
      sentence, 
      uz: uz || "", // Include Uzbek translation
      date: new Date().toISOString().split('T')[0] 
    };
    vocabData.push(newItem);
    
    fs.writeFileSync('./vocabulary.json', JSON.stringify(vocabData, null, 2));
    res.json({ success: true, item: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Not Found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("🔥", err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// ── WebRTC Matchmaking (Socket.io) ───────────────────────────────────────────
let waitingUser = null;

io.on("connection", (socket) => {
  socket.on("join_queue", async (data) => {
    const email = data?.email;
    socket.username = data?.username || "Learner";
    
    // Premium check
    if (!email) {
      socket.emit('not_premium', { reason: 'No email provided' });
      return;
    }
    
    try {
      const user = await User.findOne({ email });
      if (!user || !user.isPremium) {
        socket.emit('not_premium', { reason: 'Premium required' });
        return;
      }
    } catch (err) {
      console.error("Premium check error:", err);
      socket.emit('not_premium', { reason: 'Server error' });
      return;
    }
    
    if (waitingUser && waitingUser.id !== socket.id) {
      // Match found
      const room = "room_" + waitingUser.id + "_" + socket.id;
      
      socket.join(room);
      waitingUser.join(room);
      
      // Notify both. The waiting user will be the 'caller' to initiate SDP offer
      waitingUser.emit("match_found", { room, caller: true, partnerName: socket.username });
      socket.emit("match_found", { room, caller: false, partnerName: waitingUser.username });
      
      socket.roomId = room;
      waitingUser.roomId = room;
      
      waitingUser = null; // reset queue
    } else {
      waitingUser = socket;
    }
  });

  socket.on("leave_queue", () => {
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }
    if (socket.roomId) {
      socket.to(socket.roomId).emit("partner_disconnected");
      socket.leave(socket.roomId);
      socket.roomId = null;
    }
  });

  socket.on("offer", (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("offer", data);
    }
  });

  socket.on("answer", (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("answer", data);
    }
  });

  socket.on("ice-candidate", (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("ice-candidate", data);
    }
  });

  // Real-time AI Assistant for Face-to-Face
  socket.on("ai_request", async (data) => {
    if (!socket.roomId) return;
    const { transcript } = data;
    if (!transcript || transcript.length < 5) return;

    try {
      const { callGroq } = await import("./services/groqService.js");
      const resp = await callGroq({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful CEFR English Assistant. The users are practicing speaking. Provide a very short, supportive suggestion (max 15 words) for what to say next or a quick correction. Use simple English." },
          { role: "user", content: `User said: ${transcript}` }
        ],
        max_tokens: 60,
        temperature: 0.7
      });
      const helpText = resp.choices[0].message.content;
      io.to(socket.roomId).emit("ai_response", { text: helpText, senderId: socket.id });
    } catch (err) {
      console.error("AI Assist error:", err);
    }
  });

  socket.on("disconnect", () => {
    if (waitingUser && waitingUser.id === socket.id) waitingUser = null;
    if (socket.roomId) socket.to(socket.roomId).emit("partner_disconnected");
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Server started on: http://localhost:${PORT}`);
  initTelegramBot();
  if (MONGO_URI) {
    console.log(`📡 Attempting to connect to MongoDB...`);
    connectDB();
  } else {
    console.log(`📁 FILE-ONLY mode: user auth disabled, content routes active.`);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("\n🔌 Shutting down.");
  process.exit(0);
});
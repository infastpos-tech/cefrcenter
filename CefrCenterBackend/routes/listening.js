import express from "express";
import Listening from "../models/Listening.js";

const router = express.Router();

// ── GET all listening exercises with filters ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { level, type, accent, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (level) query.level = level;
    if (type) query.type = type;
    if (accent) query.accent = accent;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { transcript: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Listening.countDocuments(query);
    const data = await Listening.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching listening exercises",
      error: error.message 
    });
  }
});

// ── GET single listening exercise ──────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const data = await Listening.findOne({ id: req.params.id });
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Listening exercise not found" 
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching listening exercise",
      error: error.message 
    });
  }
});

// ── POST create new listening exercise ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { id, title, level, type, audioUrl, transcript, questions, vocabulary, summary, keyPoints, accent } = req.body;

    // Validation
    if (!id || !title || !level || !type || !audioUrl || !transcript) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    if (!["A1", "A2", "B1", "B2", "C1"].includes(level)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid level. Must be one of: A1, A2, B1, B2, C1" 
      });
    }

    const validTypes = ["listening-exercise", "transcript-matching", "multiple-choice", "gap-fill", "audio-comprehension"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}` 
      });
    }

    const validAccents = ["British", "American", "Australian", "General"];
    if (accent && !validAccents.includes(accent)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid accent. Must be one of: ${validAccents.join(", ")}` 
      });
    }

    // Check if ID already exists
    const exists = await Listening.findOne({ id });
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: "Listening exercise with this ID already exists" 
      });
    }

    const listening = new Listening({
      id,
      title,
      level,
      type,
      audioUrl,
      transcript,
      questions: questions || [],
      vocabulary: vocabulary || [],
      summary,
      keyPoints: keyPoints || [],
      accent: accent || "General"
    });

    await listening.save();
    res.status(201).json({ success: true, data: listening, message: "Listening exercise created" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error creating listening exercise",
      error: error.message 
    });
  }
});

// ── PUT update listening exercise ──────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { title, level, type, audioUrl, transcript, questions, vocabulary, summary, keyPoints, accent } = req.body;

    // Validation
    if (level && !["A1", "A2", "B1", "B2", "C1"].includes(level)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid level" 
      });
    }

    const validTypes = ["listening-exercise", "transcript-matching", "multiple-choice", "gap-fill", "audio-comprehension"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid type" 
      });
    }

    const validAccents = ["British", "American", "Australian", "General"];
    if (accent && !validAccents.includes(accent)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid accent. Must be one of: ${validAccents.join(", ")}` 
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (level) updateData.level = level;
    if (type) updateData.type = type;
    if (audioUrl) updateData.audioUrl = audioUrl;
    if (transcript) updateData.transcript = transcript;
    if (questions) updateData.questions = questions;
    if (vocabulary) updateData.vocabulary = vocabulary;
    if (summary) updateData.summary = summary;
    if (keyPoints) updateData.keyPoints = keyPoints;
    if (accent) updateData.accent = accent;

    const data = await Listening.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Listening exercise not found" 
      });
    }

    res.json({ success: true, data, message: "Listening exercise updated" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating listening exercise",
      error: error.message 
    });
  }
});

// ── DELETE listening exercise ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const data = await Listening.findOneAndDelete({ id: req.params.id });

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Listening exercise not found" 
      });
    }

    res.json({ success: true, message: "Listening exercise deleted", data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting listening exercise",
      error: error.message 
    });
  }
});

// ── GET exercises by level ──────────────────────────────────────────────────
router.get("/level/:level", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await Listening.find({ level: req.params.level })
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching listening exercises by level",
      error: error.message 
    });
  }
});

export default router;

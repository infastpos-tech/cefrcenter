import express from "express";
import Speaking from "../models/Speaking.js";

const router = express.Router();

// ── GET all speaking exercises with filters ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { level, type, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (level) query.level = level;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { prompt: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Speaking.countDocuments(query);
    const data = await Speaking.find(query)
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
      message: "Error fetching speaking exercises",
      error: error.message 
    });
  }
});

// ── GET single speaking exercise ──────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const data = await Speaking.findOne({ id: req.params.id });
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Speaking exercise not found" 
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching speaking exercise",
      error: error.message 
    });
  }
});

// ── POST create new speaking exercise ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { id, title, level, type, prompt, description, context, followUpQuestions, keyVocabulary, grammarPoints, sampleResponse, audioUrl } = req.body;

    // Validation
    if (!id || !title || !level || !type || !prompt || !description) {
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

    const validTypes = ["speaking-topic", "daily-conversation", "ielts-style", "self-introduction", "discussion-prompt"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}` 
      });
    }

    // Check if ID already exists
    const exists = await Speaking.findOne({ id });
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: "Speaking exercise with this ID already exists" 
      });
    }

    const speaking = new Speaking({
      id,
      title,
      level,
      type,
      prompt,
      description,
      context,
      followUpQuestions: followUpQuestions || [],
      keyVocabulary: keyVocabulary || [],
      grammarPoints: grammarPoints || [],
      sampleResponse,
      audioUrl
    });

    await speaking.save();
    res.status(201).json({ success: true, data: speaking, message: "Speaking exercise created" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error creating speaking exercise",
      error: error.message 
    });
  }
});

// ── PUT update speaking exercise ──────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { title, level, type, prompt, description, context, followUpQuestions, keyVocabulary, grammarPoints, sampleResponse, audioUrl } = req.body;

    // Validation
    if (level && !["A1", "A2", "B1", "B2", "C1"].includes(level)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid level" 
      });
    }

    const validTypes = ["speaking-topic", "daily-conversation", "ielts-style", "self-introduction", "discussion-prompt"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid type" 
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (level) updateData.level = level;
    if (type) updateData.type = type;
    if (prompt) updateData.prompt = prompt;
    if (description) updateData.description = description;
    if (context) updateData.context = context;
    if (followUpQuestions) updateData.followUpQuestions = followUpQuestions;
    if (keyVocabulary) updateData.keyVocabulary = keyVocabulary;
    if (grammarPoints) updateData.grammarPoints = grammarPoints;
    if (sampleResponse) updateData.sampleResponse = sampleResponse;
    if (audioUrl) updateData.audioUrl = audioUrl;

    const data = await Speaking.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Speaking exercise not found" 
      });
    }

    res.json({ success: true, data, message: "Speaking exercise updated" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating speaking exercise",
      error: error.message 
    });
  }
});

// ── DELETE speaking exercise ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const data = await Speaking.findOneAndDelete({ id: req.params.id });

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Speaking exercise not found" 
      });
    }

    res.json({ success: true, message: "Speaking exercise deleted", data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting speaking exercise",
      error: error.message 
    });
  }
});

// ── GET exercises by level ──────────────────────────────────────────────────
router.get("/level/:level", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await Speaking.find({ level: req.params.level })
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching speaking exercises by level",
      error: error.message 
    });
  }
});

export default router;

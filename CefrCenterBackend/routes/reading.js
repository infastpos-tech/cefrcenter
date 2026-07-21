import express from "express";
import Reading from "../models/Reading.js";

const router = express.Router();

// ── GET all reading exercises with filters ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { level, type, theme, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (level) query.level = level;
    if (type) query.type = type;
    if (theme) query.theme = theme;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { passage: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Reading.countDocuments(query);
    const data = await Reading.find(query)
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
      message: "Error fetching reading exercises",
      error: error.message 
    });
  }
});

// ── GET single reading exercise ──────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const data = await Reading.findOne({ id: req.params.id });
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Reading exercise not found" 
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching reading exercise",
      error: error.message 
    });
  }
});

// ── POST create new reading exercise ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { id, title, level, type, passage, questions, vocabulary, keyPoints, theme } = req.body;

    // Validation
    if (!id || !title || !level || !type || !passage) {
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

    const validTypes = ["short-passage", "comprehension", "multiple-choice", "vocabulary-focus", "cefr-style"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}` 
      });
    }

    // Check if ID already exists
    const exists = await Reading.findOne({ id });
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: "Reading exercise with this ID already exists" 
      });
    }

    const reading = new Reading({
      id,
      title,
      level,
      type,
      passage,
      questions: questions || [],
      vocabulary: vocabulary || [],
      keyPoints: keyPoints || [],
      theme
    });

    await reading.save();
    res.status(201).json({ success: true, data: reading, message: "Reading exercise created" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error creating reading exercise",
      error: error.message 
    });
  }
});

// ── PUT update reading exercise ──────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { title, level, type, passage, questions, vocabulary, keyPoints, theme } = req.body;

    // Validation
    if (level && !["A1", "A2", "B1", "B2", "C1"].includes(level)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid level" 
      });
    }

    const validTypes = ["short-passage", "comprehension", "multiple-choice", "vocabulary-focus", "cefr-style"];
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
    if (passage) updateData.passage = passage;
    if (questions) updateData.questions = questions;
    if (vocabulary) updateData.vocabulary = vocabulary;
    if (keyPoints) updateData.keyPoints = keyPoints;
    if (theme) updateData.theme = theme;

    const data = await Reading.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Reading exercise not found" 
      });
    }

    res.json({ success: true, data, message: "Reading exercise updated" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating reading exercise",
      error: error.message 
    });
  }
});

// ── DELETE reading exercise ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const data = await Reading.findOneAndDelete({ id: req.params.id });

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Reading exercise not found" 
      });
    }

    res.json({ success: true, message: "Reading exercise deleted", data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting reading exercise",
      error: error.message 
    });
  }
});

// ── GET exercises by level ──────────────────────────────────────────────────
router.get("/level/:level", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await Reading.find({ level: req.params.level })
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching reading exercises by level",
      error: error.message 
    });
  }
});

// ── GET exercises by theme ──────────────────────────────────────────────────
router.get("/theme/:theme", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await Reading.find({ theme: req.params.theme })
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching reading exercises by theme",
      error: error.message 
    });
  }
});

export default router;

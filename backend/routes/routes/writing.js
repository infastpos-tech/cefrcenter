import express from "express";
import Writing from "../models/Writing.js";

const router = express.Router();

// ── GET all writing exercises with filters ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { level, type, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (level) query.level = level;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Writing.countDocuments(query);
    const data = await Writing.find(query)
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
      message: "Error fetching writing exercises",
      error: error.message 
    });
  }
});

// ── GET single writing exercise ──────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const data = await Writing.findOne({ id: req.params.id });
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Writing exercise not found" 
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching writing exercise",
      error: error.message 
    });
  }
});

// ── POST create new writing exercise ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { id, title, level, type, content, instruction, example, hints, sampleAnswer, vocabulary, grammarFocus } = req.body;

    // Validation
    if (!id || !title || !level || !type || !content || !instruction) {
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

    const validTypes = ["essay", "fill-in-blank", "grammar-correction", "sentence-building", "story-writing"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}` 
      });
    }

    // Check if ID already exists
    const exists = await Writing.findOne({ id });
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: "Writing exercise with this ID already exists" 
      });
    }

    const writing = new Writing({
      id,
      title,
      level,
      type,
      content,
      instruction,
      example,
      hints: hints || [],
      sampleAnswer,
      vocabulary: vocabulary || [],
      grammarFocus: grammarFocus || []
    });

    await writing.save();
    res.status(201).json({ success: true, data: writing, message: "Writing exercise created" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error creating writing exercise",
      error: error.message 
    });
  }
});

// ── PUT update writing exercise ──────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { title, level, type, content, instruction, example, hints, sampleAnswer, vocabulary, grammarFocus } = req.body;

    // Validation
    if (level && !["A1", "A2", "B1", "B2", "C1"].includes(level)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid level" 
      });
    }

    const validTypes = ["essay", "fill-in-blank", "grammar-correction", "sentence-building", "story-writing"];
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
    if (content) updateData.content = content;
    if (instruction) updateData.instruction = instruction;
    if (example) updateData.example = example;
    if (hints) updateData.hints = hints;
    if (sampleAnswer) updateData.sampleAnswer = sampleAnswer;
    if (vocabulary) updateData.vocabulary = vocabulary;
    if (grammarFocus) updateData.grammarFocus = grammarFocus;

    const data = await Writing.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Writing exercise not found" 
      });
    }

    res.json({ success: true, data, message: "Writing exercise updated" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating writing exercise",
      error: error.message 
    });
  }
});

// ── DELETE writing exercise ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const data = await Writing.findOneAndDelete({ id: req.params.id });

    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: "Writing exercise not found" 
      });
    }

    res.json({ success: true, message: "Writing exercise deleted", data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting writing exercise",
      error: error.message 
    });
  }
});

// ── GET exercises by level ──────────────────────────────────────────────────
router.get("/level/:level", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await Writing.find({ level: req.params.level })
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching writing exercises by level",
      error: error.message 
    });
  }
});

export default router;

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import VocabularySet from "../models/Vocabulary.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const vocabularyPath = path.join(BACKEND_ROOT, "vocabulary.json");

// ── In-Memory Caching for vocabulary.json ────────────────────────────────────
let jsonSetsCache = [];

const loadVocabularyCache = () => {
  try {
    const data = fs.readFileSync(vocabularyPath, 'utf8');
    jsonSetsCache = JSON.parse(data);
    console.log("📁 Vocabulary JSON cache loaded successfully.");
  } catch (e) {
    console.warn("❌ Could not read or parse vocabulary.json:", e.message);
    jsonSetsCache = [];
  }
};

// Initial load
loadVocabularyCache();

// Watch for file changes asynchronously
fs.watch(vocabularyPath, (event) => {
  if (event === 'change') {
    console.log("♻️ vocabulary.json changed, reloading vocabulary cache...");
    // Give it a tiny delay to ensure file write is complete
    setTimeout(loadVocabularyCache, 100);
  }
});

import mongoose from "mongoose";

// GET /api/vocabulary — get all sets
router.get("/", async (req, res) => {
  try {
    // 1. Get data from MongoDB if connected
    let dbSets = [];
    if (mongoose.connection.readyState === 1) {
      try {
        dbSets = await VocabularySet
          .find({}, { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 })
          .lean();
      } catch (e) {
        dbSets = [];
      }
    }

    // 2. Merge them (using id as unique key, using cached jsonSetsCache)
    const allSetsMap = new Map();
    
    // Add JSON sets first
    jsonSetsCache.forEach(set => {
      allSetsMap.set(set.id, {
        ...set,
        title: set.categoryLabel || set.category,
        words: (set.words || []).map(w => ({
          ...w,
          translation: w.translation || `${w.uz || ''} / ${w.ru || ''}`,
          sentences: w.sentences || []
        }))
      });
    });

    // Add DB sets (DB takes priority/overwrites if same ID)
    dbSets.forEach(set => {
      allSetsMap.set(set.id, set);
    });

    const finalSets = Array.from(allSetsMap.values());
    res.json(finalSets);
  } catch (err) {
    console.error("GET /vocabulary error:", err.message);
    res.json(jsonSetsCache || []);
  }
});

// GET /api/vocabulary/:id — get one set by id
router.get("/:id", async (req, res) => {
  try {
    const set = await VocabularySet
      .findOne({ id: req.params.id }, { __v: 0, _id: 0 })
      .lean();
    if (!set) return res.status(404).json({ message: `"${req.params.id}" not found.` });
    res.json(set);
  } catch (err) {
    console.error("GET /vocabulary/:id error:", err.message);
    res.status(500).json({ message: "Database connection error", error: err.message });
  }
});

// GET /api/vocabulary/category/:category — get by category
router.get("/category/:category", async (req, res) => {
  try {
    const sets = await VocabularySet
      .find({ category: req.params.category }, { __v: 0, _id: 0 })
      .lean();
    res.json(sets);
  } catch (err) {
    console.error("GET /vocabulary/category error:", err.message);
    res.status(500).json({ message: "Database connection error", error: err.message });
  }
});

export default router;
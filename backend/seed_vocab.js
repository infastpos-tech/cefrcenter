import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import VocabularySet from "./models/Vocabulary.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const FALLBACK_DATA = [
  {
    id: 'greetings-en-uz',
    category: 'greetings',
    categoryLabel: 'Greetings',
    fromLangLabel: 'English',
    toLangLabel: "Uzbek",
    words: [
      { word: 'Hello',      translation: 'Salom',         sentences: ['Hello, how are you?', 'Hello! Nice to meet you.'] },
      { word: 'Goodbye',    translation: 'Xayr',          sentences: ['Goodbye, see you tomorrow!'] },
      { word: 'Thank you',  translation: 'Rahmat',        sentences: ['Thank you for your help.'] },
      { word: 'Please',     translation: 'Iltimos',       sentences: ['Please help me.', 'Please be quiet.'] },
      { word: 'Sorry',      translation: 'Kechirasiz',    sentences: ["Sorry, I didn't mean it."] },
      { word: 'Yes',        translation: 'Ha',            sentences: ['Yes, I understand.'] },
      { word: 'No',         translation: "Yo'q",          sentences: ["No, thank you."] },
      { word: 'Good morning', translation: 'Xayrli tong', sentences: ['Good morning! How did you sleep?'] },
    ],
  }
];

async function seed() {
  try {
    if (!MONGO_URI) {
      console.error("MONGO_URI is missing!");
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing
    await VocabularySet.deleteMany({});
    console.log("Cleared existing vocabulary.");

    let allData = [...FALLBACK_DATA];

    // Load from vocabulary.json
    try {
      const jsonData = JSON.parse(fs.readFileSync('./vocabulary.json', 'utf8'));
      allData = [...allData, ...jsonData];
      console.log(`Loaded ${jsonData.length} sets from vocabulary.json`);
    } catch (e) {
      console.warn("Could not load vocabulary.json, using fallback only.");
    }

    // Insert new
    for (const item of allData) {
        await VocabularySet.create({
            id: item.id || `set_${Math.random().toString(36).substr(2, 9)}`,
            title: item.categoryLabel || item.category,
            category: item.category,
            words: item.words.map(w => ({
              ...w,
              translation: w.translation || `${w.uz} / ${w.ru}`,
              sentences: w.sentences || []
            }))
        });
    }

    console.log("Seed successful!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();

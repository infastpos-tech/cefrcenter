import mongoose from "mongoose";

const readingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  level: { 
    type: String, 
    enum: ["A1", "A2", "B1", "B2", "C1"], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["short-passage", "comprehension", "multiple-choice", "vocabulary-focus", "cefr-style"],
    required: true 
  },
  passage: { type: String, required: true },
  questions: [{
    id: String,
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String
  }],
  vocabulary: [{
    word: String,
    definition: String,
    example: String
  }],
  keyPoints: [String],
  duration: { type: Number, default: 10 }, // minutes
  difficulty: { type: Number, min: 1, max: 5 },
  theme: { type: String }, // e.g., "travel", "food", "culture"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

readingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Reading = mongoose.model("Reading", readingSchema);
export default Reading;

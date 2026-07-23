import mongoose from "mongoose";

const listeningSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  level: { 
    type: String, 
    enum: ["A1", "A2", "B1", "B2", "C1"], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["listening-exercise", "transcript-matching", "multiple-choice", "gap-fill", "audio-comprehension"],
    required: true 
  },
  audioUrl: { type: String, required: true },
  transcript: { type: String, required: true },
  questions: [{
    id: String,
    question: String,
    options: [String],
    correctAnswer: String,
    timestamp: Number, // seconds when answer appears in audio
    explanation: String
  }],
  vocabulary: [{
    word: String,
    definition: String,
    timestamp: Number
  }],
  summary: { type: String },
  keyPoints: [String],
  duration: { type: Number }, // seconds
  difficulty: { type: Number, min: 1, max: 5 },
  accent: { type: String, enum: ["British", "American", "Australian", "General"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

listeningSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Listening = mongoose.model("Listening", listeningSchema);
export default Listening;

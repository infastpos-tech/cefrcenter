import mongoose from "mongoose";

const speakingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  level: { 
    type: String, 
    enum: ["A1", "A2", "B1", "B2", "C1"], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["speaking-topic", "daily-conversation", "ielts-style", "self-introduction", "discussion-prompt"],
    required: true 
  },
  prompt: { type: String, required: true },
  description: { type: String, required: true },
  context: { type: String },
  followUpQuestions: [String],
  keyVocabulary: [String],
  grammarPoints: [String],
  sampleResponse: { type: String },
  duration: { type: Number, default: 5 }, // minutes
  difficulty: { type: Number, min: 1, max: 5 },
  audioUrl: { type: String }, // Optional audio sample
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

speakingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Speaking = mongoose.model("Speaking", speakingSchema);
export default Speaking;

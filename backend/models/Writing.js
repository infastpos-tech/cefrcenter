import mongoose from "mongoose";

const writingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  level: { 
    type: String, 
    enum: ["A1", "A2", "B1", "B2", "C1"], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["essay", "fill-in-blank", "grammar-correction", "sentence-building", "story-writing"],
    required: true 
  },
  content: { type: String, required: true },
  instruction: { type: String, required: true },
  example: { type: String },
  hints: [String],
  sampleAnswer: { type: String },
  vocabulary: [String],
  grammarFocus: [String],
  duration: { type: Number, default: 30 }, // minutes
  difficulty: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

writingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Writing = mongoose.model("Writing", writingSchema);
export default Writing;

import mongoose from "mongoose";

const vocabularySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  words: { type: Array, default: [] }
});

const VocabularySet = mongoose.model("VocabularySet", vocabularySchema);
export default VocabularySet;

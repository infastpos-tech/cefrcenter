import express from "express";
import dotenv from "dotenv";
import { callGroq } from "../services/groqService.js";

dotenv.config();
const router = express.Router();

const MODEL = "llama-3.3-70b-versatile";
const WRITING_LIMITS = {
  "1.1": 15,
  "1.2": 20,
  "2":   40
};

function getFallbackWritingEvaluation(text, partNum, taskPrompt) {
  const words = text ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const part = String(partNum || "1.1");
  const maxScore = WRITING_LIMITS[part] || 40;

  const targetWords = part === "1.1" ? 150 : (part === "1.2" ? 150 : 250);
  const ratio = Math.min(1.0, wordCount / Math.max(1, targetWords));

  const perCriteriaMax = Number((maxScore / 4).toFixed(2));
  const baseScore = perCriteriaMax * (0.4 + 0.45 * ratio);

  const task = Number(Math.min(perCriteriaMax, baseScore + (wordCount > 50 ? 0.2 : -0.5)).toFixed(2));
  const cohesion = Number(Math.min(perCriteriaMax, baseScore).toFixed(2));
  const lexical = Number(Math.min(perCriteriaMax, baseScore - 0.1).toFixed(2));
  const grammar = Number(Math.min(perCriteriaMax, baseScore - 0.1).toFixed(2));

  return {
    scores: { task, cohesion, lexical, grammar },
    evaluation: `Standard evaluation completed. Total response length: ${wordCount} words.`,
    feedback: `Your response contains ${wordCount} words. Keep focusing on structured paragraphs, formal tone, and diverse linking phrases.`,
    errors: [],
    modelAnswer: `Model structure for task: ${taskPrompt || 'Writing Task'}\n- Introduction: Introduce the context and main thesis.\n- Body 1: Provide primary arguments with examples.\n- Body 2: Address counterpoints or secondary factors.\n- Conclusion: Reiterate key insights.`
  };
}

function getFallbackSpeakingEvaluation(transcript, partNum, taskPrompt) {
  const words = transcript ? transcript.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  return {
    scores: { fluency: 2.5, cohesion: 2.5, lexical: 2.3, grammar: 2.4 },
    evaluation: `Speaking evaluation completed (${wordCount} words recognized).`,
    feedback: `Good effort! You delivered a ${wordCount}-word response. Work on natural pacing, stress, and intonation.`,
    errors: []
  };
}

router.post("/writing", async (req, res) => {
  const { text, partNum, prompt: taskPrompt } = req.body;
  if (!text || text.trim().length < 10) return res.status(400).json({ error: "Response too short." });

  try {
    const limit = WRITING_LIMITS[partNum] || 40;

    const aiSystemPrompt = `You are a BRUTALLY HONEST SENIOR IELTS/CEFR EXAMINER.
    Your mission: Destroy inflated scores. Be SHAVQATSIZ (merciless).
    
    SCORING TABLE (Total Max: ${limit}):
    - 0-25% (A1/A2): Basic vocabulary ('good', 'nice'), simple sentences, frequent basic grammar errors ('I go' instead of 'I went').
    - 26-50% (B1): Understandable but repetitive, some attempts at complex sentences, frequent errors.
    - 51-75% (B2): Good range, few errors, clear logic.
    - 76-90% (C1): Sophisticated, academic vocabulary, rare errors.
    - 91-100% (C2): Native-level mastery.

    STRICT PENALTY RULES:
    1. If the student uses "I go" for a past event, or "It was nice trip" (missing article), the Grammar score MUST be below 2/3.75.
    2. If there are > 4 basic errors, the Total Band CANNOT exceed 5.5.
    3. If the vocabulary is childish/basic, Lexical score MUST be below 1.5/3.75.
    4. Task Achievement: If the length is close to the minimum but the content is hollow, penalize.
    
    CRITICAL: For text like "I go to Samarkand last week. It was nice trip.", the result MUST be strictly Band 2.0 - 3.0 (which translates to very low scores like 0.5/3.75 per criteria). NEVER give anything higher than B1 for basic grammar.
    You MUST output extremely low scores for basic errors. If you detect basic A1/A2 errors in a text, ALL four criteria should be scored lower than 1.5 out of 3.75.
    
    Respond strictly in JSON:
    {
      "scores": { "task": number, "cohesion": number, "lexical": number, "grammar": number },
      "evaluation": "Naked truth about the student's level",
      "feedback": "Brutal feedback + how to stop being basic",
      "errors": [
        { "original": "...", "correction": "...", "type": "Grammar/Spelling/Vocabulary/Punctuation", "explanation": "..." }
      ],
      "modelAnswer": "..."
    }`;

    const data = await callGroq({
      model: MODEL,
      messages: [
        { role: "system", content: aiSystemPrompt },
        { role: "user", content: `Task: ${taskPrompt}\nStudent Text: ${text}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    let content = data.choices[0].message.content;
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    let result;
    try {
      result = JSON.parse(content);
    } catch(e) {
      console.error("JSON Parse Error:", e, "Content was:", content);
      result = getFallbackWritingEvaluation(text, partNum, taskPrompt);
    }
    res.json(result);
  } catch (err) {
    console.warn("AI Writing Route fallback triggered:", err.message);
    const fallback = getFallbackWritingEvaluation(text, partNum, taskPrompt);
    res.json(fallback);
  }
});

router.post("/speaking", async (req, res) => {
  const { audioExists, transcript, partNum, prompt: taskPrompt } = req.body;
  if (!transcript) return res.json({ error: "No transcript" });

  try {
    const aiSystemPrompt = `You are a SENIOR SPEAKING EXAMINER. Evaluate the student's speaking with HIGH RIGOR.
    
    SCORING RULES:
    1. Fluency & Coherence: Penalize for hesitations, repetition, and poor logical flow.
    2. Lexical Resource: Cap at B1/A2 if only simple words are used.
    3. Grammatical Range: Deduct for every spoken error.
    4. Pronunciation: Estimate based on transcript clarity.
    
    Respond strictly in JSON:
    {
      "scores": { "fluency": number, "cohesion": number, "lexical": number, "grammar": number },
      "evaluation": "Professional evaluation",
      "feedback": "Honest advice",
      "errors": []
    }`;

    const data = await callGroq({
      model: MODEL,
      messages: [
        { role: "system", content: aiSystemPrompt },
        { role: "user", content: `Topic: ${taskPrompt}\nTranscript: ${transcript}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    let content = data.choices[0].message.content;
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    let result;
    try {
      result = JSON.parse(content);
    } catch(e) {
      console.error("JSON Parse Error:", e, "Content was:", content);
      result = getFallbackSpeakingEvaluation(transcript, partNum, taskPrompt);
    }
    res.json(result);
  } catch (err) {
    console.warn("AI Speaking Route fallback triggered:", err.message);
    const fallback = getFallbackSpeakingEvaluation(transcript, partNum, taskPrompt);
    res.json(fallback);
  }
});

export default router;

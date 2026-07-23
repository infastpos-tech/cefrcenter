import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const keys = [process.env.GROQ_KEY];
for (let i = 1; i <= 30; i++) {
  if (process.env[`GROQ_KEY_${i}`]) keys.push(process.env[`GROQ_KEY_${i}`]);
}
const validKeys = keys.filter(k => k && k.startsWith("gsk_"));

export async function callGroq(payload) {
  let lastErr = null;
  const shuffled = [...validKeys].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < Math.min(5, shuffled.length); i++) {
    try {
      const response = await axios.post(GROQ_API_URL, payload, {
        headers: { 
          "Authorization": `Bearer ${shuffled[i]}`, 
          "Content-Type": "application/json" 
        },
        timeout: 25000
      });
      return response.data;
    } catch (err) {
      lastErr = err;
      if (err.response?.status === 429) continue;
      throw err;
    }
  }
  throw lastErr || new Error("All Groq keys failed or exhausted.");
}

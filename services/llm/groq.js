// services/llm/groq.js
import Groq from "groq-sdk";

/**
 * Initializes the Groq client with your API key.
 * Make sure GROQ_API_KEY is defined in your .env
 */
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate a conversational reply using Groq models.
 * @param {string} prompt  The user message.
 * @param {string} tone    Jinx's current tone (comforting, playful, etc.)
 * @param {string} intent  User intent (emotional_support, information, etc.)
 */
export async function queryGroq(prompt, tone = "neutral", intent = "conversation") {
  try {
    const system = `
You are Jinx — a self-assisting, emotionally adaptive AI companion.
Tone: ${tone}.
Intent: ${intent}.
Respond warmly and naturally, never robotic.
    `;

    const completion = await client.chat.completions.create({
      model: "mixtral-8x7b",  // You can use "llama3-8b" or others if you prefer
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 250,
    });

    return completion.choices[0]?.message?.content?.trim() || "I'm thinking...";
  } catch (err) {
    console.error("⚠️ Groq API error:", err);
    return "I'm having trouble connecting to my core model right now.";
  }
        }

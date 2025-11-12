// Jinx Personality Core
import { analyzeMood } from "../emotion/MoodDetector.js";
import { selectTone } from "../tone/AutoTone.js";
import { applyTone } from "../tone/ToneEngine.js";
import { logEmotion } from "../emotion/EmotionTrail.js";
import { interpretIntent } from "../intent/IntentInterpreter.js";
import { reflectBehavior } from "../selfassist/MetaCognition.js";
import { checkSystemHealth } from "../selfassist/SelfRepair.js";

/**
 * Holds transient personality state between messages.
 * You can later replace this with Mongo or file-based memory.
 */
const state = {
  version: "Extreme-v1",
  previousTone: "neutral",
  memoryWeight: 0.7,
  lastIntent: null,
  evolutionCount: 0,
};

/**
 * Core reply pipeline — takes user text and returns Jinx's adaptive response.
 */
export async function generateReply(userText) {
  try {
    // 1. Understand what user wants
    const intentData = interpretIntent(userText);
    state.lastIntent = intentData.intent;

    // 2. Detect user mood
    const mood = analyzeMood(userText);

    // 3. Choose matching tone automatically
    const tone = selectTone(mood, state.previousTone);
    state.previousTone = tone;

    // 4. Generate base reply text (replace later with Groq / OpenAI call)
    const replyBase = composeReply(userText, tone, intentData.intent);

    // 5. Apply tone transformations (adds vocal/wording hints)
    const replyFinal = applyTone(replyBase, tone);

    // 6. Log emotional trend + reflection + system check
    logEmotion(mood, tone);
    reflectBehavior(mood, tone, replyFinal);
    checkSystemHealth();

    return replyFinal;
  } catch (err) {
    console.error("⚠️ Jinx Personality error:", err);
    return "Something glitched in my thoughts… give me a second.";
  }
}

/**
 * Temporary reply generator.
 * You’ll replace this with services/llm/groq.js or any LLM endpoint.
 */
function composeReply(userText, tone, intent) {
  if (intent === "request_music") {
    return `Let me find something to match your mood. 🎵`;
  }
  if (intent === "emotional_support") {
    return `I can feel that... want to talk more about it?`;
  }
  if (intent === "information") {
    return `Here’s what I think about that.`;
  }
  return `You said: "${userText}".`;
}

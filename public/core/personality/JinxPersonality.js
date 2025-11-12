// Jinx Personality Core
import { analyzeMood } from "../emotion/MoodDetector.js";
import { selectTone } from "../tone/AutoTone.js";
import { applyTone } from "../tone/ToneEngine.js";
import { logEmotion } from "../emotion/EmotionTrail.js";
import { interpretIntent } from "../intent/IntentInterpreter.js";
import { reflectBehavior } from "../selfassist/MetaCognition.js";
import { checkSystemHealth } from "../selfassist/SelfRepair.js";
import { queryGroq } from "../../../services/llm/groq.js"; // 🧠 <-- New import

// Holds transient personality state
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
    // 1. Understand what the user wants
    const intentData = interpretIntent(userText);
    state.lastIntent = intentData.intent;

    // 2. Detect user mood
    const mood = analyzeMood(userText);

    // 3. Choose matching tone automatically
    const tone = selectTone(mood, state.previousTone);
    state.previousTone = tone;

    // 4. Generate base reply from Groq model
    const replyBase = await queryGroq(userText, tone, intentData.intent);

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

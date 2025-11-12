import { analyzeMood } from "../emotion/MoodDetector.js";
import { selectTone } from "../tone/AutoTone.js";
import { applyTone } from "../tone/ToneEngine.js";
import { logEmotion } from "../emotion/EmotionTrail.js";
import { interpretIntent } from "../intent/IntentInterpreter.js";
import { reflectBehavior } from "../selfassist/MetaCognition.js";
import { checkSystemHealth } from "../selfassist/SelfRepair.js";

export async function generateReply(userText) {
  const intent = interpretIntent(userText);
  const mood = analyzeMood(userText);
  const tone = selectTone(mood, this.state.previousTone);
  let reply = await this.composeReply(userText, tone, intent.intent);
  reply = applyTone(reply, tone);
  logEmotion(mood, tone);
  reflectBehavior(mood, tone, reply);
  checkSystemHealth();
  this.state.previousTone = tone;
  return reply;
}

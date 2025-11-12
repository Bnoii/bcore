// Detect what the user is asking for.
export function interpretIntent(text = "") {
  const t = text.toLowerCase();
  let intent = "conversation";
  let context = "general";

  if (/play|song|music/.test(t)) intent = "request_music";
  else if (/translate|meaning/.test(t)) intent = "translation";
  else if (/miss|lonely/.test(t)) intent = "emotional_support";
  else if (/help|how|why/.test(t)) intent = "information";

  if (/sad|happy|angry|calm/.test(t)) context = "emotion_mention";
  return { intent, context };
}

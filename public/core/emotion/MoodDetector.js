// Quick sentiment + intent detector using keywords or a small ML model.
export function analyzeMood(text = "") {
  const t = text.toLowerCase();
  let sentiment = "neutral";
  let intensity = 0.4;

  if (/miss|sad|lonely|tired|hurt/.test(t)) sentiment = "sad";
  else if (/angry|mad|furious/.test(t)) sentiment = "angry";
  else if (/happy|excited|yay|love/.test(t)) sentiment = "positive";
  else if (/stress|worried|anxious/.test(t)) sentiment = "stressed";

  intensity = Math.min(1, (t.split("!").length - 1) / 3 + 0.4);
  return { sentiment, intensity };
}

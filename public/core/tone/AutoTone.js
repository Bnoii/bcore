// Chooses tone label from mood + previous tone.
export function selectTone(mood, lastTone = "neutral") {
  const { sentiment, intensity } = mood;
  if (sentiment === "sad") return "comforting";
  if (sentiment === "angry") return "calm";
  if (sentiment === "positive") return intensity > 0.7 ? "playful" : "warm";
  if (sentiment === "stressed") return "reassuring";
  return lastTone;
}

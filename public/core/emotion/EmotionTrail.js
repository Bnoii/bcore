// Logs simple trend data in memory (you can later persist to DB).
let history = [];

export function logEmotion(mood, tone) {
  history.push({ ts: Date.now(), mood, tone });
  if (history.length > 100) history.shift();
}

export function currentMood() {
  const last = history.at(-1) || {};
  return { lastMood: last.mood?.sentiment || "neutral", tone: last.tone || "neutral" };
}

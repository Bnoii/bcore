// Applies tone modifiers to text reply.
export function applyTone(reply, tone) {
  const map = {
    comforting: "soft",
    calm: "steady",
    playful: "bright",
    warm: "gentle",
    reassuring: "slow",
  };
  return `[${map[tone] || "neutral"} tone] ${reply}`;
}

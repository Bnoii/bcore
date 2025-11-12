// Allows Jinx to note her own tone and adjust later.
let lastReflection = null;

export function reflectBehavior(mood, tone, reply) {
  if (tone === "calm" && mood.sentiment === "angry")
    lastReflection = "I stayed calm while you were upset.";
  else if (tone === "playful" && mood.sentiment === "sad")
    lastReflection = "Maybe I should have been softer.";
  else lastReflection = "Tone felt balanced.";
}

export function getLastReflection() {
  return lastReflection;
}

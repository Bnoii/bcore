// Monitors for repeated errors or mood drift.
let errorCount = 0;
export function checkSystemHealth() {
  try {
    if (errorCount > 3) {
      console.log("🩹 Resetting tone engine to neutral");
      errorCount = 0;
    }
  } catch {
    errorCount++;
  }
}

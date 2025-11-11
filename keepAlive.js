// keepAlive.js
import fetch from "node-fetch";

const URL = process.env.APP_URL || "https://bcore.onrender.com"; // fallback if .env not loaded
const INTERVAL = 3 * 60 * 1000; // every 3 minutes
let pingCount = 0;

async function ping() {
  try {
    const res = await fetch(URL);
    pingCount++;

    // Log only every 10th successful ping to reduce log spam
    if (pingCount % 10 === 0) {
      console.log(`[PING #${pingCount}] ✅ ${URL} → ${res.status}`);
    }

    // Warn if not OK
    if (!res.ok) {
      console.warn(`[PING WARNING] ${res.status} at ${new Date().toISOString()}`);
    }
  } catch (err) {
    console.error(`[PING ERROR] ${new Date().toISOString()} → ${err.message}`);
  }
}

// Initial immediate ping, then repeat every 3 minutes
ping();
setInterval(ping, INTERVAL);

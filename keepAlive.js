import axios from "axios";

const URL = process.env.APP_URL || "https://bcore.up.railway.app";

setInterval(() => {
  axios
    .get(`${URL}/ping`)
    .then(() => console.log("🔁 KeepAlive ping sent"))
    .catch((err) => console.error("Ping failed:", err.message));
}, 1000 * 60 * 3); // every 3 minutes

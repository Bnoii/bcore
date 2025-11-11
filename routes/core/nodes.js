import express from "express";
import Node from "../../models/Node.js";

const router = express.Router();

// Middleware: Check Core Token
function verifyCoreToken(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!token || token !== process.env.CORE_TOKEN)
    return res.status(403).json({ error: "Forbidden: Invalid or missing core token" });
  next();
}

// 🛰️ Node Heartbeat / Register
router.post("/heartbeat", verifyCoreToken, async (req, res) => {
  try {
    const { siteId, version, url, uptime, nodeType } = req.body;
    if (!siteId) return res.status(400).json({ error: "Missing siteId" });

    const node = await Node.findOneAndUpdate(
      { siteId },
      {
        version,
        url,
        uptime,
        nodeType,
        lastSeen: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Node updated", node });
  } catch (err) {
    console.error("Core /heartbeat error:", err);
    res.status(500).json({ error: "Internal Core error" });
  }
});

// 🧩 Get all nodes
router.get("/list", async (req, res) => {
  try {
    const nodes = await Node.find().sort({ lastSeen: -1 });
    res.json({ success: true, count: nodes.length, nodes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

export default router;

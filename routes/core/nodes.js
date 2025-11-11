import express from "express";
import Node from "../../models/Node.js";
import CoreToken from "../../models/CoreToken.js";

const router = express.Router();

// 🔐 Master key fallback for manual admin actions
const MASTER_KEY = process.env.MASTER_KEY || "Hunn$0330";

// Middleware: Check Core Token or Master Key
function verifyCoreToken(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!token)
    return res.status(403).json({ error: "Forbidden: Missing authorization header" });

  // Master override
  if (token === MASTER_KEY) return next();

  if (token !== process.env.CORE_TOKEN)
    return res.status(403).json({ error: "Forbidden: Invalid core token" });

  next();
}

// =========================
// 🛰️ Node Heartbeat / Register
// =========================
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

    res.json({ success: true, message: "Node heartbeat received", node });
  } catch (err) {
    console.error("❌ Core /heartbeat error:", err);
    res.status(500).json({ error: "Internal Core error" });
  }
});

// =========================
// 📡 Get all nodes
// =========================
router.get("/list", async (req, res) => {
  try {
    const nodes = await Node.find().sort({ lastSeen: -1 });
    res.json({ success: true, count: nodes.length, nodes });
  } catch (err) {
    console.error("Node list error:", err);
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

// =========================
// 📊 Quick stats
// =========================
router.get("/stats", async (req, res) => {
  try {
    const since = new Date(Date.now() - 2 * 60 * 1000);
    const all = await Node.countDocuments();
    const online = await Node.countDocuments({ lastSeen: { $gte: since } });
    res.json({ success: true, all, online, windowMinutes: 2 });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// =========================
// 🔑 TOKEN MANAGEMENT
// =========================

// List all tokens (Master only)
router.get("/tokens", verifyCoreToken, async (req, res) => {
  try {
    const tokens = await CoreToken.find().sort({ createdAt: -1 });
    res.json({ success: true, tokens });
  } catch (err) {
    console.error("Token list error:", err);
    res.status(500).json({ error: "Failed to list tokens" });
  }
});

// Create new token
router.post("/token", verifyCoreToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing token name" });

    const token = Math.random().toString(36).slice(2, 20);
    const doc = await CoreToken.create({
      name,
      token,
      active: true,
      createdAt: new Date(),
    });

    res.json({ success: true, token, doc });
  } catch (err) {
    console.error("Token create error:", err);
    res.status(500).json({ error: "Failed to create token" });
  }
});

// Delete / revoke token
router.delete("/token/:id", verifyCoreToken, async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await CoreToken.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: "Token not found" });
    res.json({ success: true, removed });
  } catch (err) {
    console.error("Token delete error:", err);
    res.status(500).json({ error: "Failed to delete token" });
  }
});

export default router;

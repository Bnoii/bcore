// routes/core/nodes.js
import express from "express";
import Node from "../../models/Node.js";

const router = express.Router();

// 🔒 Verify Core Token (security)
function verifyCoreToken(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!token || token !== process.env.CORE_TOKEN) {
    return res.status(403).json({ error: "Forbidden: Invalid or missing core token" });
  }
  next();
}

// 🛰️ Node Heartbeat + Auto Registration
router.post("/heartbeat", verifyCoreToken, async (req, res) => {
  try {
    const { siteId, version, url, uptime, nodeType, name } = req.body;
    if (!siteId) return res.status(400).json({ error: "Missing siteId" });

    let node = await Node.findOne({ siteId });
    let isNew = false;

    if (!node) {
      // Auto-register new node
      node = await Node.create({
        siteId,
        version,
        url,
        uptime,
        nodeType,
        name: name || "Unnamed Node",
        status: "new",
        lastSeen: new Date(),
      });
      isNew = true;
    } else {
      node.version = version;
      node.url = url;
      node.uptime = uptime;
      node.nodeType = nodeType;
      node.status = "online";
      node.lastSeen = new Date();
      await node.save();
    }

    res.json({ success: true, message: "Node updated", new: isNew });
  } catch (err) {
    console.error("Core /heartbeat error:", err);
    res.status(500).json({ error: "Internal Core error" });
  }
});

// 📊 Get Core Stats
router.get("/stats", async (req, res) => {
  try {
    const since = new Date(Date.now() - 2 * 60 * 1000);
    const all = await Node.countDocuments();
    const online = await Node.countDocuments({ lastSeen: { $gte: since } });
    res.json({ success: true, all, online, windowMinutes: 2 });
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// 📜 Get All Registered Nodes
router.get("/list", async (req, res) => {
  try {
    const nodes = await Node.find().sort({ lastSeen: -1 });
    res.json({ success: true, count: nodes.length, nodes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

export default router;;

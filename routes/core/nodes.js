// routes/core/nodes.js
import express from "express";
import Node from "../../models/Node.js";
import CoreToken from "../../models/CoreToken.js";
import crypto from "crypto";

const router = express.Router();

// 🔒 Verify Core Token (for nodes reporting themselves)
function verifyCoreToken(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!token || token !== process.env.CORE_TOKEN) {
    return res.status(403).json({ error: "Forbidden: Invalid or missing core token" });
  }
  next();
}

// 🔐 Verify Admin Key (for dashboard token control)
function verifyAdminCoreKey(req, res, next) {
  const key = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!key || key !== process.env.CORE_ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid admin key" });
  }
  next();
}

// 🛰️ Node Heartbeat + Auto Registration
router.post("/heartbeat", verifyCoreToken, async (req, res) => {
  try {
    const { siteId, version, url, uptime, nodeType, name } = req.body;
    if (!siteId) return res.status(400).json({ error: "Missing siteId" });

    let node = await Node.findOne({ siteId });
    const now = new Date();
    let isNew = false;

    if (!node) {
      node = await Node.create({
        siteId,
        version,
        url,
        uptime,
        nodeType,
        name: name || "Unnamed Node",
        status: "new",
        lastSeen: now,
      });
      isNew = true;
    } else {
      node.version = version;
      node.url = url;
      node.uptime = uptime;
      node.nodeType = nodeType;
      node.status = "online";
      node.lastSeen = now;
      await node.save();
    }

    res.json({ success: true, message: "Node updated", new: isNew });
  } catch (err) {
    console.error("Core /heartbeat error:", err);
    res.status(500).json({ error: "Internal Core error" });
  }
});

// 📊 Core Stats
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

// 📜 List All Nodes
router.get("/list", async (req, res) => {
  try {
    const nodes = await Node.find().sort({ lastSeen: -1 });
    res.json({ success: true, count: nodes.length, nodes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

//
// 🔑 CORE TOKEN MANAGEMENT (Admin)
//

// GET all tokens
router.get("/tokens", verifyAdminCoreKey, async (req, res) => {
  try {
    const tokens = await CoreToken.find().sort({ createdAt: -1 });
    res.json({ success: true, tokens });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

// POST create new token
router.post("/token", verifyAdminCoreKey, async (req, res) => {
  try {
    const { name, ttlHours } = req.body;
    if (!name) return res.status(400).json({ error: "Missing name" });

    const token = crypto.randomBytes(24).toString("hex");
    let expiresAt = null;
    if (ttlHours && Number(ttlHours) > 0) {
      expiresAt = new Date(Date.now() + Number(ttlHours) * 3600 * 1000);
    }

    const newToken = await CoreToken.create({ name, token, expiresAt });
    res.json({ success: true, token: newToken.token });
  } catch (err) {
    console.error("Core /token error:", err);
    res.status(500).json({ error: "Failed to create token" });
  }
});

// DELETE revoke token
router.delete("/token/:id", verifyAdminCoreKey, async (req, res) => {
  try {
    const { id } = req.params;
    await CoreToken.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to revoke token" });
  }
});

export default router;

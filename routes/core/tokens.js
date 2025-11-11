import express from "express";
import crypto from "crypto";
import CoreToken from "../../models/CoreToken.js";

const router = express.Router();
const MASTER_KEY = process.env.MASTER_KEY || "Hunn$0330";

// Middleware for master access
function verifyMaster(req, res, next) {
  const key = req.headers["x-master-key"];
  if (key !== MASTER_KEY) return res.status(403).json({ error: "Forbidden" });
  next();
}

// 🔹 List all tokens
router.get("/", verifyMaster, async (req, res) => {
  const tokens = await CoreToken.find().sort({ createdAt: -1 });
  res.json({ success: true, tokens });
});

// 🔹 Create new token
router.post("/create", verifyMaster, async (req, res) => {
  const { name, expiresIn } = req.body;
  const tokenValue = crypto.randomBytes(24).toString("hex");
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 86400000) : null;

  const token = await CoreToken.create({ name, token: tokenValue, expiresAt });
  res.json({ success: true, token });
});

// 🔹 Revoke token
router.post("/revoke", verifyMaster, async (req, res) => {
  const { token } = req.body;
  await CoreToken.findOneAndUpdate({ token }, { active: false });
  res.json({ success: true, message: "Token revoked" });
});

export default router;

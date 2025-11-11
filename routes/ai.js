import express from "express";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

// Simple chat mock endpoint
router.post("/chat", /* verifyToken, */ async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: "No text provided" });

    // TODO: wire to services/llm/groq.js in your private repo
    res.json({ reply: `Jinx says: You said "${text}"` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

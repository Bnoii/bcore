// routes/jinx/ai.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { generateReply } from "../../public/core/personality/JinxPersonality.js";

const router = express.Router();

/**
 * 🧩 Main chat endpoint for Jinx AI
 * This is where text from the user gets sent into the personality engine.
 */
router.post("/chat", /* verifyToken, */ async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ success: false, error: "No text provided" });
    }

    // 🔹 Generate a reply through Jinx's behaviour pipeline
    const reply = await generateReply(text);

    // 🔸 Return the AI's output
    res.json({ success: true, reply });
  } catch (err) {
    console.error("⚠️ Jinx AI error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

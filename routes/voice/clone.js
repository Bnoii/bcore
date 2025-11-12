import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Ensure uploads dir exists
const uploadDir = process.env.VOICE_UPLOAD_DIR || "uploads/voices";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

/**
 * POST /voice/clone
 * multipart/form-data: { voice: <file>, text: <string>, provider?: "auto"|"openvoice"|"elevenlabs"|"huggingface" }
 */
router.post("/clone", upload.single("voice"), async (req, res) => {
  try {
    const { text = "", provider = "auto" } = req.body || {};
    if (!req.file) return res.status(400).json({ error: "No voice sample uploaded" });
    if (!text.trim()) return res.status(400).json({ error: "Text is required" });

    // Delegate to VoiceAdapter for provider selection / routing
    const { cloneVoice } = await import("../../services/VoiceAdapter.js");
    const result = await cloneVoice({
      provider,
      text,
      filePath: path.resolve(req.file.path),
    });

    return res.json({
      success: true,
      engine: result.engine,
      audio_url: result.audio_url,
    });
  } catch (err) {
    console.error("[/voice/clone] Error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Voice cloning failed" });
  }
});

export default router;

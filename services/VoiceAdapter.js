import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const cfg = {
  default_engine: process.env.DEFAULT_VOICE_ENGINE || "openvoice",
  openvoice_url: process.env.OPENVOICE_URL || "http://openvoice-bridge:5005",
  elevenlabs_key: process.env.ELEVENLABS_API_KEY || "",
  huggingface_token: process.env.HUGGINGFACE_API_TOKEN || "",
};

/**
 * cloneVoice({ provider, text, filePath })
 * Returns: { engine, audio_url }
 */
export async function cloneVoice({ provider = "auto", text, filePath }) {
  const chosen = provider === "auto" ? cfg.default_engine : provider;

  if (chosen === "openvoice") {
    try {
      const form = new FormData();
      form.append("text", text);
      form.append("voice", fs.createReadStream(filePath));
      const url = `${cfg.openvoice_url.replace(/\/$/, "")}/clone`;
      const resp = await axios.post(url, form, { headers: form.getHeaders(), timeout: 120000 });
      return { engine: "openvoice", audio_url: resp.data.audio_url };
    } catch (e) {
      console.warn("[VoiceAdapter] OpenVoice failed, falling back to ElevenLabs. Reason:", e.message);
      // fallthrough to elevenlabs
    }
  }

  if (chosen === "elevenlabs" || chosen === "openvoice") {
    // Fallback to ElevenLabs (placeholder – implement full flow if you want file-based voice clones)
    if (!cfg.elevenlabs_key) throw new Error("ELEVENLABS_API_KEY missing");
    // For demo, we generate using a stock voice. Replace with your cloned voice_id logic.
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel (example/public)
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const resp = await axios.post(url, { text }, {
      headers: { "xi-api-key": cfg.elevenlabs_key, "Content-Type": "application/json" },
      responseType: "arraybuffer",
    });
    const outDir = process.env.VOICE_OUTPUT_DIR || "uploads/voices";
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `elevenlabs_${Date.now()}.mp3`);
    fs.writeFileSync(outPath, Buffer.from(resp.data));
    return { engine: "elevenlabs", audio_url: `/static/${path.basename(outPath)}` };
  }

  if (chosen === "huggingface") {
    if (!cfg.huggingface_token) throw new Error("HUGGINGFACE_API_TOKEN missing");
    // Simple HF TTS example (model must support TTS via Inference API)
    const model = process.env.HF_TTS_MODEL || "facebook/mms-tts-eng";
    const resp = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      text,
      {
        headers: { Authorization: `Bearer ${cfg.huggingface_token}`, "Content-Type": "application/json" },
        responseType: "arraybuffer",
      }
    );
    const outDir = process.env.VOICE_OUTPUT_DIR || "uploads/voices";
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `huggingface_${Date.now()}.wav`);
    fs.writeFileSync(outPath, Buffer.from(resp.data));
    return { engine: "huggingface", audio_url: `/static/${path.basename(outPath)}` };
  }

  throw new Error("No valid provider available");
}

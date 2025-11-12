import mongoose from "mongoose";

const VoiceProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  voiceSampleUrl: { type: String },
  provider: { type: String, enum: ["openvoice", "elevenlabs", "huggingface"], default: "openvoice" },
  providerVoiceId: { type: String }, // e.g., ElevenLabs voice_id
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.VoiceProfile || mongoose.model("VoiceProfile", VoiceProfileSchema);

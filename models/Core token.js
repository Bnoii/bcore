import mongoose from "mongoose";

const CoreTokenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
});

export default mongoose.models.CoreToken || mongoose.model("CoreToken", CoreTokenSchema);

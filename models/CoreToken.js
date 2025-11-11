import mongoose from "mongoose";

const CoreTokenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

export default mongoose.models.CoreToken || mongoose.model("CoreToken", CoreTokenSchema);

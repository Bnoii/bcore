import mongoose from "mongoose";

const keySchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  scope: { type: String, enum: ['global', 'user'], default: 'global' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Key || mongoose.model("Key", keySchema);

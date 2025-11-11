import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  level: { type: String, enum: ['info','warn','error'], default: 'info' },
  message: { type: String, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Log || mongoose.model("Log", logSchema);

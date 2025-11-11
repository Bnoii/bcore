import mongoose from "mongoose";

const NodeSchema = new mongoose.Schema({
  siteId: { type: String, unique: true },
  version: String,
  url: String,
  uptime: String,
  nodeType: { type: String, default: "standard" },
  lastSeen: { type: Date, default: Date.now },
});

export default mongoose.models.Node || mongoose.model("Node", NodeSchema);

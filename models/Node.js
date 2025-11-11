// models/Node.js
import mongoose from "mongoose";

const NodeSchema = new mongoose.Schema({
  siteId: { type: String, required: true, unique: true },
  name: { type: String, default: "Unnamed Node" },
  nodeType: { type: String, default: "standard" },
  version: { type: String },
  url: { type: String },
  uptime: { type: Number },
  status: { type: String, default: "new" },
  lastSeen: { type: Date, default: Date.now },
});

export default mongoose.models.Node || mongoose.model("Node", NodeSchema);

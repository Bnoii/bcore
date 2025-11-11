// server.js (ESM)
// Make sure "type": "module" is set in package.json

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

// Keep-alive (pings itself so Render free tier stays awake)
import "./keepAlive.js";

// Feature routers
import aiRouter from "./routes/ai.js";
import musicRouter from "./routes/music.js";
import translateRouter from "./routes/translate.js";
import doubtRouter from "./routes/doubt.js";

// Core (Network/Nodes) router
import nodeRouter from "./routes/core/nodes.js";

import tokenRouter from "./routes/core/tokens.js";

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB (auto-reconnect-ish)
const MONGO = process.env.MONGO_URI;
if (MONGO) {
  const connectDB = async () => {
    try {
      await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 5000 });
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ Mongo error:", err.message);
      console.log("🔁 Retrying MongoDB connection in 5s…");
      setTimeout(connectDB, 5000);
    }
  };
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected! Retrying…");
    connectDB();
  });
  connectDB();
} else {
  console.warn("⚠️ No MONGO_URI set. Add it to your env.");
}

// Health
app.get("/", (_req, res) => res.send("🧠 Jinx Core v3.A (bcore) running."));
app.get("/ping", (_req, res) => res.send("pong"));

// Feature routes
app.use("/jinx/ai", aiRouter);
app.use("/music", musicRouter);
app.use("/translate", translateRouter);
app.use("/jinx/doubt", doubtRouter);
app.use("/core/tokens", tokenRouter);
// Core API + Dashboard
app.use("/core/nodes", nodeRouter); // API
app.use("/core", express.static(path.join(__dirname, "public/core"))); // static dashboard
app.get("/core*", (_req, res) =>
  res.sendFile(path.join(__dirname, "public/core/index.html"))
);

// 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Jinx Core running on port ${PORT}`);
  console.log(`🌍 App URL: ${process.env.APP_URL || "not set"}`);
  console.log(`🌱 Env: ${process.env.NODE_ENV || "development"}`);
});

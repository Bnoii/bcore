import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

import "./keepAlive.js"; // KeepAlive internal pinger
import aiRouter from "./routes/ai.js";
import musicRouter from "./routes/music.js";
import translateRouter from "./routes/translate.js";
import doubtRouter from "./routes/doubt.js";

// after other imports
import nodeRouter from "./routes/core/nodes.js";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ...existing middleware

// Core API
app.use("/core/nodes", nodeRouter);

// Serve the Core Dashboard (static)
app.use("/core", express.static(path.join(__dirname, "public/core")));

// Nice redirect: /core -> dashboard page
app.get("/core", (req, res) => {
  res.sendFile(path.join(__dirname, "public/core/index.html"));
});


dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// 🧠 MongoDB connection with auto-reconnect
if (process.env.MONGO_URI) {
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // fail fast if connection issue
      });
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ Mongo error:", err.message);
      console.log("🔁 Retrying MongoDB connection in 5s...");
      setTimeout(connectDB, 5000);
    }
  };

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected! Retrying...");
    connectDB();
  });

  connectDB();
} else {
  console.warn("⚠️ No MONGO_URI set. Set it in Render Environment Variables.");
}

// 🌐 Health & root routes
app.get("/", (req, res) => res.send("🧠 Jinx Core v3.A (bcore) running."));
app.get("/ping", (req, res) => res.send("pong"));

// 🧩 Routers
app.use("/jinx/ai", aiRouter);
app.use("/music", musicRouter);
app.use("/translate", translateRouter);
app.use("/jinx/doubt", doubtRouter);

// ⚠️ 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// 🚀 Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Jinx Core running on port ${PORT}`);
  console.log(`🌍 App URL: ${process.env.APP_URL || "not set"}`);
  console.log(`🌱 Env: ${process.env.NODE_ENV}`);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

import './keepAlive.js'; // KeepAlive pinger
import aiRouter from "./routes/ai.js";
import musicRouter from "./routes/music.js";
import translateRouter from "./routes/translate.js";
import doubtRouter from "./routes/doubt.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// MongoDB connection (optional if URI present)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ Mongo error:", err));
} else {
  console.warn("⚠️ No MONGO_URI set. Set it in Railway Variables.");
}

// Health & root
app.get("/", (req, res) => res.send("🧠 Jinx Core v3.A (bcore) running."));
app.get("/ping", (req, res) => res.send("pong"));

// Routers
app.use("/jinx/ai", aiRouter);
app.use("/music", musicRouter);
app.use("/translate", translateRouter);
app.use("/jinx/doubt", doubtRouter);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Jinx Core running on port ${PORT}`));

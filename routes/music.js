import express from "express";
const router = express.Router();

// Minimal placeholder
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").toString();
  if (!q) return res.status(400).json({ error: "Missing 'q' query" });
  res.json({ results: [{ title: `Sample track for '${q}'`, id: "demo123" }] });
});

export default router;

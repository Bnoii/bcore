import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const q = (req.query.q || "").toString();
  if (!q) return res.status(400).json({ error: "Missing 'q' query" });
  // placeholder
  res.json({ text: q, translated: q.split('').reverse().join('') });
});

export default router;

import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: "No question provided" });
  res.json({ answer: "This is a placeholder answer. Wire your solver here." });
});

export default router;

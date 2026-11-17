const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const adminAuth = require("../middleware/adminAuth");

// GET /api/messages
// Returns active messages, newest first. The app polls this (same 15-min cycle as update
// checks) and shows anything whose _id it hasn't shown yet - see Messages.kt on the app side.
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find({ active: true }).sort({ createdAt: -1 }).limit(20);
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/messages   (header: x-admin-key)
// body: { title, body, type? }
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, body, type = "info" } = req.body;
    if (!title || !body) return res.status(400).json({ error: "title and body are required" });
    const msg = await Message.create({ title, body, type });
    res.status(201).json(msg);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/messages/:id   (header: x-admin-key)
// Deactivates a message instead of deleting it, so you keep a history.
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!msg) return res.status(404).json({ error: "not found" });
    res.json(msg);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

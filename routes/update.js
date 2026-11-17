const express = require("express");
const router = express.Router();
const Update = require("../models/Update");
const adminAuth = require("../middleware/adminAuth");

// GET /api/update
// Called by the app (Updater.kt). Returns the newest version the owner has published.
// Shape matches what Updater.kt's fromJson() already expects, so no app-side parsing changes needed.
router.get("/", async (req, res) => {
  try {
    const u = await Update.findOne().sort({ createdAt: -1 });
    if (!u) return res.status(404).json({ error: "no update published yet" });
    res.json({
      versionCode: u.versionCode,
      versionName: u.versionName,
      notes: u.notes,
      apkUrl: u.apkUrl,
      mandatory: u.mandatory,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/update   (header: x-admin-key)
// body: { versionCode, versionName, notes, apkUrl, mandatory }
// Publishes a new version. Simplest flow: build the APK, upload it somewhere
// (GitHub release asset, your own host, etc.), then call this with the direct download link.
router.post("/", adminAuth, async (req, res) => {
  try {
    const { versionCode, versionName, apkUrl, notes = "", mandatory = false } = req.body;
    if (!versionCode || !versionName || !apkUrl) {
      return res.status(400).json({ error: "versionCode, versionName and apkUrl are required" });
    }
    const u = await Update.create({ versionCode, versionName, notes, apkUrl, mandatory });
    res.status(201).json(u);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

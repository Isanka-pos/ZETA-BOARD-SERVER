const mongoose = require("mongoose");

// Announcements / broadcast messages shown inside the app (separate from version updates).
// e.g. "Server maintenance tonight", "New sticker pack added", "PRO offer this week".
const messageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    // info | warning | promo - lets the app pick an icon/color, purely cosmetic
    type: { type: String, default: "info" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);

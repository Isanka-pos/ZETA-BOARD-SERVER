const mongoose = require("mongoose");

// Only one document ever exists here (singleton "current" row) - it holds whatever
// version is the newest one the app owner wants installed right now.
const updateSchema = new mongoose.Schema(
  {
    versionCode: { type: Number, required: true },
    versionName: { type: String, required: true },
    notes: { type: String, default: "" },
    apkUrl: { type: String, required: true },
    mandatory: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Update", updateSchema);

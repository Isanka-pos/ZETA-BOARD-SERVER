const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./db");
const updateRoutes = require("./routes/update");
const messageRoutes = require("./routes/messages");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Make sure Mongo is connected before any route touches the database.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    res.status(500).json({ error: "database connection failed: " + e.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/update", updateRoutes);
app.use("/api/messages", messageRoutes);

module.exports = app;

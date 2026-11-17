const mongoose = require("mongoose");

// Vercel runs this file fresh on every cold start, but re-uses the same process (and this
// cached connection) for requests that land on an already-warm instance. Without this cache,
// every request would open a brand new connection to Atlas and you'd run out of connections.
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;

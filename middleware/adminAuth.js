// Anything that changes data (new update, new message, delete) must send this header:
//   x-admin-key: <ADMIN_KEY from your .env / Heroku config vars>
// Read-only endpoints the app calls (GET /api/update, GET /api/messages) need no key.
module.exports = function adminAuth(req, res, next) {
  const key = req.header("x-admin-key");
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "unauthorized - missing or wrong x-admin-key" });
  }
  next();
};

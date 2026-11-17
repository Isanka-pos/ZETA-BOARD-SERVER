require("dotenv").config();
// Vercel treats any file under /api as a serverless function. An Express app instance is
// itself a valid (req, res) handler, so exporting it directly is all that's needed here -
// no serverless-http wrapper required.
module.exports = require("../app");

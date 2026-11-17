require("dotenv").config();
// Local development only - Vercel never runs this file, it calls api/index.js instead.
const app = require("./app");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Zeta Board server running on http://localhost:" + PORT));

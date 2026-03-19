const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { summarizeMaterial } = require("../controllers/summarizeController");

router.post("/", auth, summarizeMaterial);

module.exports = router;
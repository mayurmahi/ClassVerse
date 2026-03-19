const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.get("/all", async (req, res) => {
  const users = await require("../models/User").find();
  res.json(users);
});

// VERY IMPORTANT
module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ChatMessage = require("../models/ChatMessage");

// GET /api/chat/:classroomId — Get previous messages
router.get("/:classroomId", auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      classroomId: req.params.classroomId,
    })
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getAllUsers, removeUser, getStats } = require("../controllers/adminController");

router.get("/stats", auth, getStats);
router.get("/users", auth, getAllUsers);
router.delete("/users/:id", auth, removeUser);

module.exports = router;
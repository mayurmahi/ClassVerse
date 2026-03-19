const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createClassroom,
  joinClassroom,
  getMyClassrooms,
  getClassroomById,
  removeStudent,
} = require("../controllers/classroomController");

// All routes are protected
router.post("/create", auth, createClassroom);
router.post("/join", auth, joinClassroom);
router.get("/my", auth, getMyClassrooms);
router.get("/:id", auth, getClassroomById);
router.delete("/:id/remove/:studentId", auth, removeStudent);

module.exports = router;
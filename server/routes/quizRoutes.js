const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  suggestQuestions,
  createQuiz,
  getQuizzesByClassroom,
  getQuizById,
  submitQuiz,
  getSubmissions,
  deleteQuiz,
} = require("../controllers/quizController");

// AI suggest questions for teacher
router.post("/suggest", auth, suggestQuestions);

// Teacher creates quiz
router.post("/create", auth, createQuiz);

// Get all quizzes for a classroom
router.get("/classroom/:classroomId", auth, getQuizzesByClassroom);

// Get single quiz
router.get("/:quizId", auth, getQuizById);

// Student submits quiz
router.post("/:quizId/submit", auth, submitQuiz);

// Teacher views all submissions for a quiz
router.get("/:quizId/submissions", auth, getSubmissions);

// Teacher deletes quiz
router.delete("/:quizId", auth, deleteQuiz);

module.exports = router;
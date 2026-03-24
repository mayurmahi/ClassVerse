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

// ── Static / specific routes FIRST (before any /:param routes) ──────────────

// AI suggest questions for teacher
router.post("/suggest", auth, suggestQuestions);

// Teacher creates quiz
router.post("/create", auth, createQuiz);

// Get all quizzes for a classroom
router.get("/classroom/:classroomId", auth, getQuizzesByClassroom);

// ── Parameterised routes LAST ────────────────────────────────────────────────

// Student submits quiz
router.post("/:quizId/submit", auth, submitQuiz);

// Teacher views all submissions for a quiz
router.get("/:quizId/submissions", auth, getSubmissions);

// Teacher deletes quiz
router.delete("/:quizId", auth, deleteQuiz);

// Get single quiz  ← must come after /:quizId/submissions & /:quizId/submit
router.get("/:quizId", auth, getQuizById);

module.exports = router;
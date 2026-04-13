const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  suggestQuestions,
  createQuiz,
  publishAnswers,
  getQuizzesByClassroom,
  getQuizById,
  submitQuiz,
  getSubmissions,
  deleteQuiz,
} = require("../controllers/quizController");

// ── Static routes first ──────────────────────────────────────────────────────
router.post("/suggest",                 auth, suggestQuestions);
router.post("/create",                  auth, createQuiz);
router.get("/classroom/:classroomId",   auth, getQuizzesByClassroom);

// ── Parameterised routes ─────────────────────────────────────────────────────
router.post("/:quizId/submit",          auth, submitQuiz);
router.patch("/:quizId/publish-answers", auth, publishAnswers);   // ← NEW
router.get("/:quizId/submissions",      auth, getSubmissions);
router.delete("/:quizId",              auth, deleteQuiz);
router.get("/:quizId",                 auth, getQuizById);

module.exports = router;
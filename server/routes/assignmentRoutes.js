const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const {
  createAssignment,
  getAssignments,
  submitAssignment,
  deleteSubmission,
  getSubmissions,
  getMySubmission,
  updateAssignment,
  deleteAssignment,
  gradeSubmission,
} = require("../controllers/assignmentController");

// ── Multer: accepts both assignment attachments AND student submission files ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".txt", ".png", ".jpg", ".jpeg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ── Specific routes first (before param routes) ──────────────────────────────
router.get("/submissions/:assignmentId", auth, getSubmissions);
router.get("/mystatus/:assignmentId",    auth, getMySubmission);
router.delete("/submission/:submissionId", auth, deleteSubmission);
router.put("/submission/grade/:submissionId", auth, gradeSubmission);

// ── Assignment CRUD ───────────────────────────────────────────────────────────
// Create — multipart so teacher can optionally attach a file
router.post("/create", auth, upload.single("attachment"), createAssignment);

// Edit assignment (title, description, deadline, totalMarks — no file update needed)
router.put("/:assignmentId", auth, updateAssignment);

// Delete assignment
router.delete("/:assignmentId", auth, deleteAssignment);

// ── Get all assignments for a classroom ──────────────────────────────────────
router.get("/:classroomId", auth, getAssignments);

// ── Student submit ────────────────────────────────────────────────────────────
router.post("/submit", auth, upload.single("file"), submitAssignment);

module.exports = router;
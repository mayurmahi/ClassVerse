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
} = require("../controllers/assignmentController");

// Multer config for assignment submissions
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
  const allowed = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, PPT files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Specific routes first
router.get("/submissions/:assignmentId", auth, getSubmissions);
router.get("/mystatus/:assignmentId", auth, getMySubmission);
router.delete("/submission/:submissionId", auth, deleteSubmission);

// General routes
router.post("/create", auth, createAssignment);
router.get("/:classroomId", auth, getAssignments);
router.post("/submit", auth, upload.single("file"), submitAssignment);

module.exports = router;
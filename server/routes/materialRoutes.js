const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const { uploadMaterial, getMaterials, deleteMaterial } = require("../controllers/materialController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
  // ❌ DO NOT put limits here
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".ppt", ".pptx", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PPT, and DOC files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // ✅ limits goes HERE, inside multer()
});

router.post("/upload", auth, upload.single("file"), uploadMaterial);
router.get("/:classroomId", auth, getMaterials);
router.delete("/:materialId", auth, deleteMaterial);

module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const { uploadMaterial, getMaterials } = require("../controllers/materialController");

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // files saved in server/uploads/
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Only allow PDF and PPT
const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".ppt", ".pptx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and PPT files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/upload", auth, upload.single("file"), uploadMaterial);
router.get("/:classroomId", auth, getMaterials);

module.exports = router;
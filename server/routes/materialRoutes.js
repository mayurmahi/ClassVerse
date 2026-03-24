const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary"); // ← Cloudinary wala upload
const { uploadMaterial, getMaterials, deleteMaterial } = require("../controllers/materialController");



router.post("/upload", auth, upload.single("file"), uploadMaterial);
router.get("/:classroomId", auth, getMaterials);
router.delete("/:materialId", auth, deleteMaterial);

module.exports = router;
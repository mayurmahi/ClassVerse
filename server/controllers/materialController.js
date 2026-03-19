const Material = require("../models/Material");
const path = require("path");

// POST /api/materials/upload — Teacher uploads material
const uploadMaterial = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can upload" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { classroomId, title } = req.body;

    if (!classroomId || !title) {
      return res.status(400).json({ message: "classroomId and title required" });
    }

    // Get file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = ext === ".pdf" ? "PDF" : "PPT";

    const material = new Material({
      classroomId,
      title,
      fileType,
      filePath: req.file.filename,
      uploadedBy: req.user.id,
    });

    await material.save();

    res.status(201).json({
      message: "Material uploaded successfully",
      material,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/materials/:classroomId — Get all materials
const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({
      classroomId: req.params.classroomId,
    }).populate("uploadedBy", "name");

    res.status(200).json({ materials });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { uploadMaterial, getMaterials };
const Material = require("../models/Material");
const path = require("path");
const fs = require("fs");

// ── POST /api/materials/upload — Teacher uploads material ─────────────────────
const uploadMaterial = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can upload materials" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { classroomId, title, description } = req.body;

    if (!classroomId || !title) {
      return res.status(400).json({ message: "classroomId and title are required" });
    }

    // Derive a clean file type label from the extension
    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    const fileTypeMap = {
      pdf:  "pdf",
      ppt:  "ppt",
      pptx: "pptx",
      doc:  "doc",
      docx: "docx",
    };
    const fileType = fileTypeMap[ext] || ext;

    const material = new Material({
      classroomId,
      title,
      description: description || "",
      fileType,
      filePath: req.file.filename,
      uploadedBy: req.user.id,
    });

    await material.save();

    res.status(201).json({ message: "Material uploaded successfully", material });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/materials/:classroomId — Get all materials for a classroom ────────
const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({
      classroomId: req.params.classroomId,
    })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ materials });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── DELETE /api/materials/:materialId — Teacher deletes material ───────────────
const deleteMaterial = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can delete materials" });
    }

    const material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Material not found" });

    if (material.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this material" });
    }

    // Delete the physical file from disk
    const filePath = path.join(__dirname, "../uploads", material.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await material.deleteOne();

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { uploadMaterial, getMaterials, deleteMaterial };
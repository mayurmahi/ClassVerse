const Material = require("../models/Material");
const { cloudinary } = require("../config/cloudinary");

// ── POST /api/materials/upload ────────────────────────────────────────────────
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

    // ── Block if same title already exists in this classroom ─────────────────
    const existing = await Material.findOne({ classroomId, title: title.trim() });
    if (existing) {
      return res.status(400).json({
        message: `"${title.trim()}" already exists in this classroom. Please use a different title.`,
      });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    const fileTypeMap = { pdf: "pdf", ppt: "ppt", pptx: "pptx", doc: "doc", docx: "docx" };
    const fileType = fileTypeMap[ext] || ext;
    const resourceType = req.file.resource_type || "raw";

    const material = new Material({
      classroomId,
      title:        title.trim(),
      description:  description || "",
      filePath:     req.file.filename,
      fileType,
      fileUrl:      req.file.path,
      resourceType,
      uploadedBy:   req.user.id,
    });

    await material.save();
    console.log("REQ FILE:", req.file);
    res.status(201).json({ message: "Material uploaded successfully", material });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/materials/:classroomId ───────────────────────────────────────────
const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ classroomId: req.params.classroomId })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ materials });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── DELETE /api/materials/:materialId ─────────────────────────────────────────
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

    const resourceType = material.resourceType || "raw";
    await cloudinary.uploader.destroy(material.filePath, { resource_type: resourceType });

    await material.deleteOne();
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { uploadMaterial, getMaterials, deleteMaterial };
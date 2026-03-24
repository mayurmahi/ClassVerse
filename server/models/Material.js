const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fileType: { type: String, required: true },
    filePath: { type: String, required: true },    // Cloudinary public_id — used for deletion
    fileUrl:  { type: String, required: true },    // Cloudinary CDN URL   — used for reads
    resourceType: { type: String, default: "raw" }, // FIX: "image" | "video" | "raw" — used for correct deletion
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
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
    filePath: { type: String, required: true },   
    fileUrl: { type: String, required: true },    
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
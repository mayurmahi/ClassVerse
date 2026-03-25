const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    attachmentPath: {
      type: String,
      default: null,
    },
    // FIX: Cloudinary CDN URL used by the frontend to open/download the attachment
    attachmentUrl: {
      type: String,
      default: null,
    },
    // FIX: "image" | "video" | "raw" — must match how Cloudinary stored the file
    //      so cloudinary.uploader.destroy() uses the correct resource_type
    attachmentResType: {
      type: String,
      default: "raw",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
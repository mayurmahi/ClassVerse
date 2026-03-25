const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // kept as-is — stores Cloudinary public_id (was disk filename before migration)
    filePathOrText: {
      type: String,
      required: true,
    },
    // FIX: Cloudinary CDN URL used by the frontend to open/download the submission
    fileUrl: {
      type: String,
      default: null,
    },
    // FIX: "image" | "video" | "raw" — must match how Cloudinary stored the file
    //      so cloudinary.uploader.destroy() uses the correct resource_type
    resourceType: {
      type: String,
      default: "raw",
    },
    note: {
      type: String,
      default: "",
    },
    grade: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
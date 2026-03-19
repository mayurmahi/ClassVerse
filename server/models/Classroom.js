const mongoose = require("mongoose");

// Classroom schema
const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    // Auto-generated 6-char unique join code
    joinCode: {
      type: String,
      required: true,
      unique: true,
    },

    // Teacher who created this classroom
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Students enrolled in this classroom
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Classroom", classroomSchema);
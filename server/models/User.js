const mongoose = require("mongoose");

// User schema (Admin / Teacher / Student)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["SuperAdmin","Admin", "Teacher", "Student"],
      required: true,
    },
     // null for SuperAdmin, set for all others
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
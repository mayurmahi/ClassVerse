const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // Email domain — e.g. "college.edu" 
    // Students/Teachers with this domain auto-join this org
    emailDomain: {
      type: String,
      required: true,
      unique: true,
    },
    // Admin who manages this organization
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
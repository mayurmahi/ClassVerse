const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const Organization = require("../models/Organization");

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === "SuperAdmin";

    if (isSuperAdmin) {
      // SuperAdmin sees everything
      const totalUsers = await User.countDocuments();
      const totalOrganizations = await Organization.countDocuments();
      const totalClassrooms = await Classroom.countDocuments();
      const totalTeachers = await User.countDocuments({ role: "Teacher" });
      const totalStudents = await User.countDocuments({ role: "Student" });
      const totalAdmins = await User.countDocuments({ role: "Admin" });

      return res.status(200).json({
        totalUsers,
        totalOrganizations,
        totalClassrooms,
        totalTeachers,
        totalStudents,
        totalAdmins,
      });
    }

    // College Admin sees only their org
    const orgId = req.user.organizationId;
    const totalUsers = await User.countDocuments({ organizationId: orgId });
    const totalClassrooms = await Classroom.countDocuments({ organizationId: orgId });
    const totalTeachers = await User.countDocuments({ organizationId: orgId, role: "Teacher" });
    const totalStudents = await User.countDocuments({ organizationId: orgId, role: "Student" });

    res.status(200).json({
      totalUsers,
      totalClassrooms,
      totalTeachers,
      totalStudents,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === "SuperAdmin";

    let users;
    if (isSuperAdmin) {
      // SuperAdmin sees all users with org info
      users = await User.find()
        .select("-password")
        .populate("organizationId", "name emailDomain");
    } else {
      // College Admin sees only their org users
      users = await User.find({ organizationId: req.user.organizationId })
        .select("-password");
    }

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/admin/users/:id
const removeUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent self deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // College Admin can only delete users in their org
    if (req.user.role === "Admin") {
      if (user.organizationId?.toString() !== req.user.organizationId?.toString()) {
        return res.status(403).json({ message: "Not authorized to remove this user" });
      }
    }

    // Nobody can delete SuperAdmin
    if (user.role === "SuperAdmin") {
      return res.status(403).json({ message: "Cannot delete SuperAdmin" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/admin/organizations — SuperAdmin only
const getAllOrganizations = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "SuperAdmin only" });
    }

    const orgs = await Organization.find()
      .populate("adminId", "name email");

    res.status(200).json({ organizations: orgs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// POST /api/admin/organizations — SuperAdmin adds new org + admin account
const addOrganization = async (req, res) => {
  try {
    console.log("Add org request:", req.body); // add this
    console.log("User role:", req.user.role);
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "SuperAdmin only" });
    }

    const { collegeName, emailDomain, adminName, adminEmail, adminPassword } = req.body;

    if (!collegeName || !emailDomain || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if domain already exists
    const existingOrg = await Organization.findOne({ emailDomain });
    if (existingOrg) {
      return res.status(400).json({ message: "Organization with this email domain already exists" });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Admin email already registered" });
    }

    // Create organization
    const org = await Organization.create({
      name: collegeName,
      emailDomain: emailDomain.toLowerCase().trim(),
    });

    // Create admin account
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "Admin",
      organizationId: org._id,
    });

    // Link admin to org
    await Organization.findByIdAndUpdate(org._id, { adminId: admin._id });

    res.status(201).json({
      message: "Organization and admin account created successfully",
      organization: { name: org.name, emailDomain: org.emailDomain },
      admin: { name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Add org error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/admin/organizations/:id — SuperAdmin removes entire org
const deleteOrganization = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "SuperAdmin only" });
    }

    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Delete all users in this org
    await User.deleteMany({ organizationId: req.params.id });

    // Delete all classrooms in this org
    await Classroom.deleteMany({ organizationId: req.params.id });

    // Delete organization
    await Organization.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Organization and all associated data removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Export mein add karo
module.exports = {
  getStats,
  getAllUsers,
  removeUser,
  getAllOrganizations,
  addOrganization,
  deleteOrganization
};
const User = require("../models/User");
const Classroom = require("../models/Classroom");

// GET /api/admin/users — Get all users
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can access this" });
    }

    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/admin/users/:id — Remove a user
const removeUser = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can access this" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/admin/stats — Get platform stats
const getStats = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can access this" });
    }

    const totalUsers = await User.countDocuments();
    const totalClassrooms = await Classroom.countDocuments();
    const totalTeachers = await User.countDocuments({ role: "Teacher" });
    const totalStudents = await User.countDocuments({ role: "Student" });

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

module.exports = { getAllUsers, removeUser, getStats };
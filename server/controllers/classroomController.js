const Classroom = require("../models/Classroom");

// Generate random 6-char join code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// POST /api/classroom/create — Teacher creates classroom
const createClassroom = async (req, res) => {
  try {
    // Only teacher can create
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can create classrooms" });
    }

    const { name, subject } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ message: "Name and subject are required" });
    }

    // Generate unique join code
    let joinCode = generateJoinCode();
    let existing = await Classroom.findOne({ joinCode });
    while (existing) {
      joinCode = generateJoinCode();
      existing = await Classroom.findOne({ joinCode });
    }

    const classroom = new Classroom({
      name,
      subject,
      joinCode,
      teacherId: req.user.id,
      members: [],
    });

    await classroom.save();

    res.status(201).json({
      message: "Classroom created successfully",
      classroom,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/classroom/join — Student joins using join code
const joinClassroom = async (req, res) => {
  try {
    // Only student can join
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students can join classrooms" });
    }

    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({ message: "Join code is required" });
    }

    const classroom = await Classroom.findOne({ joinCode });

    if (!classroom) {
      return res.status(404).json({ message: "Invalid join code" });
    }

    // Check if already a member
    if (classroom.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already enrolled in this classroom" });
    }

    // Add student to members
    classroom.members.push(req.user.id);
    await classroom.save();

    res.status(200).json({
      message: "Joined classroom successfully",
      classroom,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/classroom/my — Get classrooms for logged in user
const getMyClassrooms = async (req, res) => {
  try {
    let classrooms;

    if (req.user.role === "Teacher") {
      // Teacher sees classrooms they created
      classrooms = await Classroom.find({ teacherId: req.user.id })
        .populate("members", "name email");
    } else {
      // Student sees classrooms they joined
      classrooms = await Classroom.find({ members: req.user.id })
        .populate("teacherId", "name email");
    }

    res.status(200).json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/classroom/:id — Get single classroom
const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate("teacherId", "name email")
      .populate("members", "name email");

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    res.status(200).json({ classroom });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/classroom/:id/remove/:studentId — Teacher removes student
const removeStudent = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Only the teacher of this classroom can remove
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    classroom.members = classroom.members.filter(
      (m) => m.toString() !== req.params.studentId
    );

    await classroom.save();

    res.status(200).json({ message: "Student removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createClassroom,
  joinClassroom,
  getMyClassrooms,
  getClassroomById,
  removeStudent,
};
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const fs = require("fs");
const path = require("path");

// POST /api/assignments/create — Teacher creates assignment
const createAssignment = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can create assignments" });
    }

    const { classroomId, title, description, deadline } = req.body;

    if (!classroomId || !title || !description || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const assignment = new Assignment({
      classroomId,
      title,
      description,
      deadline: new Date(deadline),
      createdBy: req.user.id,
    });

    await assignment.save();

    res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/assignments/:classroomId — Get all assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      classroomId: req.params.classroomId,
    }).populate("createdBy", "name");

    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/assignments/submit — Student submits assignment (file)
const submitAssignment = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students can submit" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required" });
    }

    // Check deadline
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ message: "Deadline has passed" });
    }

    // Check already submitted
    const existing = await Submission.findOne({
      assignmentId,
      studentId: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already submitted — delete first to resubmit" });
    }

    const submission = new Submission({
      assignmentId,
      studentId: req.user.id,
      filePathOrText: req.file.filename,
    });

    await submission.save();

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/assignments/submission/:submissionId — Student deletes submission
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Only the student who submitted can delete
    if (submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check deadline not passed
    const assignment = await Assignment.findById(submission.assignmentId);
    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ message: "Cannot delete after deadline" });
    }

    // Delete file from storage
    const filePath = path.join(__dirname, "../uploads", submission.filePathOrText);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Submission.findByIdAndDelete(req.params.submissionId);

    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/assignments/submissions/:assignmentId — Teacher views submissions
const getSubmissions = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can view submissions" });
    }

    const submissions = await Submission.find({
      assignmentId: req.params.assignmentId,
    }).populate("studentId", "name email");

    res.status(200).json({ submissions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/assignments/mystatus/:assignmentId — Check if student submitted
const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user.id,
    });

    res.status(200).json({ submission });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  submitAssignment,
  deleteSubmission,
  getSubmissions,
  getMySubmission,
};
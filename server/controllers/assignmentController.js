const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const fs = require("fs");
const path = require("path");

// ── POST /api/assignments/create — Teacher creates assignment ─────────────────
const createAssignment = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can create assignments" });
    }

    const { classroomId, title, description, deadline, totalMarks } = req.body;

    if (!classroomId || !title || !description || !deadline) {
      return res.status(400).json({ message: "classroomId, title, description and deadline are required" });
    }

    const assignment = new Assignment({
      classroomId,
      title,
      description,
      deadline: new Date(deadline),
      totalMarks: totalMarks ? Number(totalMarks) : 100,
      attachmentPath: req.file ? req.file.filename : null,
      createdBy: req.user.id,
    });

    await assignment.save();

    res.status(201).json({ message: "Assignment created successfully", assignment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PUT /api/assignments/:assignmentId — Teacher edits assignment ─────────────
const updateAssignment = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can edit assignments" });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this assignment" });
    }

    const { title, description, deadline, totalMarks } = req.body;

    if (title)       assignment.title       = title;
    if (description) assignment.description = description;
    if (deadline)    assignment.deadline    = new Date(deadline);
    if (totalMarks)  assignment.totalMarks  = Number(totalMarks);

    await assignment.save();

    res.status(200).json({ message: "Assignment updated successfully", assignment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── DELETE /api/assignments/:assignmentId — Teacher deletes assignment ─────────
const deleteAssignment = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can delete assignments" });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this assignment" });
    }

    // Delete teacher's attachment file from disk (if any)
    if (assignment.attachmentPath) {
      const attachPath = path.join(__dirname, "../uploads", assignment.attachmentPath);
      if (fs.existsSync(attachPath)) fs.unlinkSync(attachPath);
    }

    // Delete all student submission files + records for this assignment
    const submissions = await Submission.find({ assignmentId: assignment._id });
    for (const sub of submissions) {
      const subFile = path.join(__dirname, "../uploads", sub.filePathOrText);
      if (fs.existsSync(subFile)) fs.unlinkSync(subFile);
    }
    await Submission.deleteMany({ assignmentId: assignment._id });

    await assignment.deleteOne();

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/assignments/:classroomId — Get all assignments for a classroom ───
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      classroomId: req.params.classroomId,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── POST /api/assignments/submit — Student submits assignment file ─────────────
const submitAssignment = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students can submit assignments" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const { assignmentId, note } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ message: "Deadline has passed" });
    }

    // Prevent duplicate submission
    const existing = await Submission.findOne({ assignmentId, studentId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Already submitted — delete first to resubmit" });
    }

    const submission = new Submission({
      assignmentId,
      studentId: req.user.id,
      filePathOrText: req.file.filename,
      note: note || "",
    });

    await submission.save();

    res.status(201).json({ message: "Assignment submitted successfully", submission });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── DELETE /api/assignments/submission/:submissionId — Student deletes own submission
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Block deletion after deadline
    const assignment = await Assignment.findById(submission.assignmentId);
    if (assignment && new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ message: "Cannot delete submission after deadline" });
    }

    // Delete uploaded file from disk
    const filePath = path.join(__dirname, "../uploads", submission.filePathOrText);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Submission.findByIdAndDelete(req.params.submissionId);

    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── GET /api/assignments/submissions/:assignmentId — Teacher views all submissions
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

// ── GET /api/assignments/mystatus/:assignmentId — Student checks own submission
const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user.id,
    });

    res.status(200).json({ submission: submission || null });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PUT /api/assignments/submission/grade/:submissionId — Teacher grades a submission
const gradeSubmission = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can grade submissions" });
    }

    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: "Grade is required" });
    }

    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Verify the teacher owns the assignment this submission belongs to
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to grade this submission" });
    }

    // Validate grade is within range
    const maxMarks = assignment.totalMarks || 100;
    if (Number(grade) < 0 || Number(grade) > maxMarks) {
      return res.status(400).json({ message: `Grade must be between 0 and ${maxMarks}` });
    }

    submission.grade    = Number(grade);
    submission.feedback = feedback || "";
    await submission.save();

    res.status(200).json({ message: "Submission graded successfully", submission });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignments,
  submitAssignment,
  deleteSubmission,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
};
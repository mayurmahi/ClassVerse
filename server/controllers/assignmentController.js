const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const { cloudinary } = require("../config/cloudinary");

// ── Helper: safely delete a file from Cloudinary ──────────────────────────────
// resource_type must match how the file was originally uploaded.
// With resource_type:"auto" on upload, Cloudinary auto-classifies:
//   images (jpg/png/gif/webp)  → "image"
//   videos                     → "video"
//   everything else (pdf/doc…) → "raw"
// We store resourceType / attachmentResType on the model at upload time so we
// always pass the right value here. Errors are logged but never crash the caller.
const destroyFromCloudinary = async (publicId, resourceType) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "raw",
    });
  } catch (err) {
    console.error("Cloudinary destroy error:", err.message);
  }
};

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
      createdBy: req.user.id,
    });

    // FIX: save Cloudinary public_id, CDN URL and resource_type instead of disk filename
    if (req.file) {
      assignment.attachmentPath    = req.file.filename;               // Cloudinary public_id
      assignment.attachmentUrl     = req.file.path;                   // Cloudinary CDN URL
      assignment.attachmentResType = req.file.resource_type || "raw"; // for deletion
    }

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

    // FIX: if a new attachment is uploaded, delete the old one from Cloudinary first,
    //      then save the new Cloudinary file details
    if (req.file) {
      await destroyFromCloudinary(assignment.attachmentPath, assignment.attachmentResType);
      assignment.attachmentPath    = req.file.filename;
      assignment.attachmentUrl     = req.file.path;
      assignment.attachmentResType = req.file.resource_type || "raw";
    }

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

    // FIX: delete teacher's attachment from Cloudinary (was deleting from disk before)
    if (assignment.attachmentPath) {
      await destroyFromCloudinary(assignment.attachmentPath, assignment.attachmentResType);
    }

    // FIX: delete every student submission file from Cloudinary (was deleting from disk before)
    const submissions = await Submission.find({ assignmentId: assignment._id });
    await Promise.all(
      submissions.map((sub) =>
        destroyFromCloudinary(sub.filePathOrText, sub.resourceType)
      )
    );

    // Delete all submission records from DB
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
      studentId:      req.user.id,
      filePathOrText: req.file.filename,               // FIX: Cloudinary public_id (was disk filename)
      fileUrl:        req.file.path,                   // FIX: Cloudinary CDN URL for frontend reads
      resourceType:   req.file.resource_type || "raw", // FIX: stored for correct deletion later
      note:           note || "",
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

    // FIX: delete submitted file from Cloudinary (was deleting from disk before)
    await destroyFromCloudinary(submission.filePathOrText, submission.resourceType);

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
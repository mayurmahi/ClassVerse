const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options:  [{ type: String, required: true }],
  answer:   { type: String, required: true },
  marks:    { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title:       { type: String,  required: true },
    description: { type: String,  default: "" },
    deadline:    { type: Date,    required: true },
    questions:   [questionSchema],
    totalMarks:  { type: Number,  default: 0 },
    isPublished: { type: Boolean, default: true },

    // ── NEW ──────────────────────────────────────────────────────────────────
    // When false (default): students can submit but cannot see correct answers
    //   or their score.
    // When true: students can see their graded result and correct answers.
    answersPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
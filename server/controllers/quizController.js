const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const Material = require("../models/Material");
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Helper: extract text from PDF ────────────────────────────────────────────
const extractPdfText = async (filePath) => {
  try {
    const pdfParse = require("pdf-parse");
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text.slice(0, 3000); // cap to avoid token overflow
  } catch (err) {
    console.error("PDF parse error:", err.message);
    return null;
  }
};

// ── POST /api/quiz/suggest ────────────────────────────────────────────────────
const suggestQuestions = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can use this" });
    }

    const { materialId } = req.body;
    if (!materialId) return res.status(400).json({ message: "materialId is required" });

    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ message: "Material not found" });

    // Attempt to extract real file content for better question generation
    let fileContent = null;
    const filePath = path.join(__dirname, "../uploads", material.filePath);
    if (fs.existsSync(filePath) && (material.fileType || "").toLowerCase() === "pdf") {
      fileContent = await extractPdfText(filePath);
    }

    const contentBlock = fileContent
      ? `Extracted content from the material:\n\n${fileContent}`
      : `Material title: "${material.title}"\nDescription: "${material.description || "not provided"}"\nFile type: ${material.fileType}\n\nGenerate questions appropriate for this topic.`;

    const prompt = `You are an expert educational quiz creator. ${contentBlock}

Generate exactly 8 multiple-choice questions suitable for a student quiz.

IMPORTANT: Return ONLY a raw JSON object. No markdown, no backticks, no explanation text before or after. Start your response with { and end with }.

Required format:
{
  "questions": [
    {
      "question": "What is X?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "suggestedMarks": 1
    }
  ]
}

Rules:
- Exactly 4 options per question
- The "answer" string must be EXACTLY identical (character-for-character) to one of the options
- suggestedMarks: 1=easy, 2=medium, 3=hard
- Mix: 3 easy, 3 medium, 2 hard`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].text.trim();
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("AI JSON parse failed:", raw.slice(0, 300));
      return res.status(500).json({ message: "AI returned invalid format. Please try again." });
    }

    if (!Array.isArray(parsed.questions)) {
      return res.status(500).json({ message: "AI response missing questions. Please try again." });
    }

    // Only keep structurally valid questions
    const valid = parsed.questions.filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.answer &&
        q.options.includes(q.answer)
    );

    if (valid.length === 0) {
      return res.status(500).json({ message: "AI questions failed validation. Please try again." });
    }

    res.json({ questions: valid });
  } catch (err) {
    console.error("suggestQuestions error:", err);
    res.status(500).json({ message: "Failed to generate suggestions: " + err.message });
  }
};

// ── POST /api/quiz/create ─────────────────────────────────────────────────────
const createQuiz = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can create quizzes" });
    }

    const { classroomId, materialId, title, description, deadline, questions } = req.body;

    if (!classroomId || !materialId || !title || !deadline || !questions?.length) {
      return res.status(400).json({ message: "classroomId, materialId, title, deadline, and questions are required" });
    }

    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ message: "Deadline must be in the future" });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim()) return res.status(400).json({ message: `Question ${i + 1} has no text` });
      if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => !o?.trim())) {
        return res.status(400).json({ message: `Question ${i + 1} must have 4 non-empty options` });
      }
      if (!q.answer?.trim()) return res.status(400).json({ message: `Question ${i + 1} has no answer selected` });
      if (!q.options.includes(q.answer)) {
        return res.status(400).json({ message: `Question ${i + 1}: answer must exactly match one option` });
      }
    }

    const totalMarks = questions.reduce((s, q) => s + (Number(q.marks) || 1), 0);

    const quiz = new Quiz({
      classroomId,
      materialId,
      createdBy: req.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      deadline: new Date(deadline),
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()),
        answer: q.answer.trim(),
        marks: Number(q.marks) || 1,
      })),
      totalMarks,
      isPublished: true,
    });

    await quiz.save();
    res.status(201).json({ message: "Quiz published successfully", quiz });
  } catch (err) {
    console.error("createQuiz error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ── GET /api/quiz/classroom/:classroomId ─────────────────────────────────────
// Used by BOTH teachers and students. Students get answers stripped + their submission.
const getQuizzesByClassroom = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      classroomId: req.params.classroomId,
      isPublished: true,
    })
      .populate("materialId", "title fileType")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    const now = new Date();

    if (req.user.role === "Student") {
      const quizIds = quizzes.map((q) => q._id);
      const submissions = await QuizSubmission.find({
        quizId: { $in: quizIds },
        studentId: req.user.id,
      }).select("quizId totalMarksAwarded totalMarks percentage submittedAt");

      const subMap = {};
      submissions.forEach((s) => { subMap[s.quizId.toString()] = s; });

      const result = quizzes.map((q) => {
        const obj = q.toObject();
        // Strip answers from questions before sending to student
        obj.questions = obj.questions.map(({ answer, ...rest }) => rest);
        obj.submission = subMap[q._id.toString()] || null;
        obj.isExpired = q.deadline < now;
        return obj;
      });

      return res.json({ quizzes: result });
    }

    // Teacher
    const result = await Promise.all(
      quizzes.map(async (q) => {
        const count = await QuizSubmission.countDocuments({ quizId: q._id });
        return { ...q.toObject(), submissionCount: count, isExpired: q.deadline < now };
      })
    );

    res.json({ quizzes: result });
  } catch (err) {
    console.error("getQuizzesByClassroom error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ── GET /api/quiz/:quizId ─────────────────────────────────────────────────────
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate("materialId", "title fileType")
      .populate("createdBy", "name");

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const obj = quiz.toObject();
    if (req.user.role === "Student") {
      obj.questions = obj.questions.map(({ answer, ...rest }) => rest);
      obj.submission = await QuizSubmission.findOne({ quizId: quiz._id, studentId: req.user.id });
    }
    obj.isExpired = quiz.deadline < new Date();
    res.json({ quiz: obj });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ── POST /api/quiz/:quizId/submit ─────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students can submit quizzes" });
    }

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (!quiz.isPublished) return res.status(400).json({ message: "Quiz is not available" });
    if (quiz.deadline < new Date()) return res.status(400).json({ message: "Quiz deadline has passed" });

    const existing = await QuizSubmission.findOne({ quizId: quiz._id, studentId: req.user.id });
    if (existing) return res.status(400).json({ message: "You have already submitted this quiz" });

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: `Please answer all ${quiz.questions.length} questions` });
    }

    let totalMarksAwarded = 0;
    const gradedAnswers = answers.map((a) => {
      const q = quiz.questions[a.questionIndex];
      if (!q) return { questionIndex: a.questionIndex, selectedOption: a.selectedOption, isCorrect: false, marksAwarded: 0 };
      const isCorrect = q.answer === a.selectedOption;
      const marksAwarded = isCorrect ? (q.marks || 1) : 0;
      totalMarksAwarded += marksAwarded;
      return { questionIndex: a.questionIndex, selectedOption: a.selectedOption, isCorrect, marksAwarded };
    });

    const percentage = quiz.totalMarks > 0
      ? Math.round((totalMarksAwarded / quiz.totalMarks) * 100)
      : 0;

    const submission = new QuizSubmission({
      quizId: quiz._id,
      studentId: req.user.id,
      classroomId: quiz.classroomId,
      answers: gradedAnswers,
      totalMarksAwarded,
      totalMarks: quiz.totalMarks,
      percentage,
    });

    await submission.save();

    // Return full questions WITH answers after submission (for result screen)
    res.status(201).json({
      message: "Quiz submitted successfully",
      result: {
        totalMarksAwarded,
        totalMarks: quiz.totalMarks,
        percentage,
        gradedAnswers,
        questions: quiz.questions, // safe to include answers now
      },
    });
  } catch (err) {
    console.error("submitQuiz error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ── GET /api/quiz/:quizId/submissions ─────────────────────────────────────────
const getSubmissions = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can view submissions" });
    }

    const quiz = await Quiz.findById(req.params.quizId).select("title totalMarks questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const submissions = await QuizSubmission.find({ quizId: req.params.quizId })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.json({ quiz, submissions });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ── DELETE /api/quiz/:quizId ──────────────────────────────────────────────────
const deleteQuiz = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can delete quizzes" });
    }

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this quiz" });
    }

    await QuizSubmission.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

module.exports = {
  suggestQuestions,
  createQuiz,
  getQuizzesByClassroom,
  getQuizById,
  submitQuiz,
  getSubmissions,
  deleteQuiz,
};




// const Quiz = require("../models/Quiz");
// const QuizSubmission = require("../models/QuizSubmission");
// const Material = require("../models/Material");
// const axios = require("axios");

// // ── SUGGEST QUESTIONS ────────────────────────────────────────────────────────
// const suggestQuestions = async (req, res) => {
//   try {
//     if (req.user.role !== "Teacher") {
//       return res.status(403).json({ message: "Only teachers can use this" });
//     }

//     const { materialId } = req.body;
//     if (!materialId) {
//       return res.status(400).json({ message: "materialId is required" });
//     }

//     const material = await Material.findById(materialId);
//     if (!material) {
//       return res.status(404).json({ message: "Material not found" });
//     }

//     let fileContent = null;

//     // ✅ Cloudinary PDF
//     if (material.fileType === "pdf" && material.fileUrl) {
//       try {
//         const pdfParse = require("pdf-parse");

//         const response = await axios.get(material.fileUrl, {
//           responseType: "arraybuffer",
//         });

//         const data = await pdfParse(response.data);
//         fileContent = data.text.slice(0, 3000);
//       } catch (err) {
//         console.error("Cloudinary PDF error:", err.message);
//       }
//     }

//     const contentBlock = fileContent
//       ? `Content:\n${fileContent}`
//       : `Topic: ${material.title}`;

//     const prompt = `Generate exactly 8 MCQ questions in JSON format ONLY:

// {
//  "questions":[
//   {
//    "question":"",
//    "options":["","","",""],
//    "answer":"",
//    "suggestedMarks":1
//   }
//  ]
// }

// Rules:
// - Exactly 4 options
// - Answer must match one option exactly
// - No explanation

// ${contentBlock}`;

//     let response;

//     try {
//       response = await axios.post(
//         "https://openrouter.ai/api/v1/chat/completions",
//         {
//           model: "meta-llama/llama-3-8b-instruct",
//           messages: [{ role: "user", content: prompt }],
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     } catch (err) {
//       console.log("OpenRouter ERROR:", err.response?.data || err.message);
//       return res.status(500).json({ message: "AI API failed" });
//     }

//     const raw = response.data?.choices?.[0]?.message?.content || "";

//     if (!raw) {
//       return res.status(500).json({ message: "Empty AI response" });
//     }

//     // ✅ Extract JSON
//     const clean = raw.replace(/```json|```/g, "").trim();

//     const start = clean.indexOf("{");
//     const end = clean.lastIndexOf("}");

//     if (start === -1 || end === -1) {
//       return res.status(500).json({
//         message: "Invalid AI format",
//       });
//     }

//     let parsed;
//     try {
//       parsed = JSON.parse(clean.slice(start, end + 1));
//     } catch {
//       return res.status(500).json({
//         message: "Invalid JSON from AI",
//       });
//     }

//     res.json({ questions: parsed.questions });

//   } catch (err) {
//     console.error("suggestQuestions error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ── CREATE QUIZ ──────────────────────────────────────────────────────────────
// const createQuiz = async (req, res) => {
//   try {
//     const { classroomId, materialId, title, deadline, questions } = req.body;

//     if (!classroomId || !materialId || !title || !deadline || !questions?.length) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const totalMarks = questions.reduce(
//       (sum, q) => sum + (q.suggestedMarks || 1),
//       0
//     );

//     const quiz = await Quiz.create({
//       classroomId,
//       materialId,
//       title,
//       deadline,
//       questions,
//       totalMarks,
//       createdBy: req.user.id, // ✅ FIX
//     });

//     res.json({ quiz });

//   } catch (err) {
//     console.error("createQuiz error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ── SUBMIT QUIZ (FULLY FIXED) ────────────────────────────────────────────────
// const submitQuiz = async (req, res) => {
//   try {
//     const { quizId, answers } = req.body;

//     if (!quizId || !answers?.length) {
//       return res.status(400).json({ message: "Missing data" });
//     }

//     const quiz = await Quiz.findById(quizId);

//     if (!quiz) {
//       return res.status(404).json({ message: "Quiz not found" });
//     }

//     // ✅ Evaluate answers
//     const evaluatedAnswers = answers.map((ans, index) => {
//       const correctAnswer = quiz.questions[index].answer;

//       return {
//         ...ans,
//         isCorrect: ans.selectedOption === correctAnswer,
//       };
//     });

//     // ✅ Calculate score
//     const score = evaluatedAnswers.reduce(
//       (total, ans, index) =>
//         ans.isCorrect
//           ? total + (quiz.questions[index].suggestedMarks || 1)
//           : total,
//       0
//     );

//     const submission = await QuizSubmission.create({
//       quizId,
//       classroomId: quiz.classroomId,
//       studentId: req.user.id,
//       answers: evaluatedAnswers,
//       score,
//     });

//     res.json({ submission });

//   } catch (err) {
//     console.error("submitQuiz error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ── OTHER CONTROLLERS ────────────────────────────────────────────────────────
// const getQuizzesByClassroom = async (req, res) => {
//   const quizzes = await Quiz.find({ classroomId: req.params.classroomId });
//   res.json({ quizzes });
// };

// const getQuizById = async (req, res) => {
//   const quiz = await Quiz.findById(req.params.quizId);
//   res.json({ quiz });
// };

// const getSubmissions = async (req, res) => {
//   const submissions = await QuizSubmission.find({ quizId: req.params.quizId });
//   res.json({ submissions });
// };

// const deleteQuiz = async (req, res) => {
//   await Quiz.findByIdAndDelete(req.params.quizId);
//   res.json({ message: "Deleted" });
// };

// module.exports = {
//   suggestQuestions,
//   createQuiz,
//   getQuizzesByClassroom,
//   getQuizById,
//   submitQuiz,
//   getSubmissions,
//   deleteQuiz,
// };
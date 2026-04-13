const Quiz            = require("../models/Quiz");
const QuizSubmission  = require("../models/QuizSubmission");
const Material        = require("../models/Material");
const axios           = require("axios");

// ── SUGGEST QUESTIONS ────────────────────────────────────────────────────────
const suggestQuestions = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can use this" });
    }

    const { materialId } = req.body;
    if (!materialId) return res.status(400).json({ message: "materialId is required" });

    const material = await Material.findById(materialId).lean();
    if (!material) return res.status(404).json({ message: "Material not found" });

    let fileContent = null;

    if (material.fileType === "pdf" && material.fileUrl) {
      try {
        const pdfParse = require("pdf-parse");
        const pdfRes   = await axios.get(material.fileUrl, { responseType: "arraybuffer", timeout: 10000 });
        const data     = await pdfParse(pdfRes.data);
        fileContent    = data.text.slice(0, 2000);
      } catch (err) {
        console.error("PDF error:", err.message);
      }
    }

    const contentBlock = fileContent ? `Content:\n${fileContent}` : `Topic: ${material.title}`;

    const prompt = `Generate MCQ questions in JSON format ONLY:

{
 "questions":[
  {
   "question":"",
   "options":["","","",""],
   "answer":"",
   "suggestedMarks":1
  }
 ]
}

Rules:
- Exactly 4 options per question
- Answer must match one option exactly
- No explanation

${contentBlock}`;

    let aiResponse;
    try {
      aiResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model:       "meta-llama/llama-3-8b-instruct",
          messages:    [{ role: "user", content: prompt }],
          max_tokens:  1200,
          temperature: 0.3,
        },
        {
          headers:   { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
          timeout:   15000,
        }
      );
    } catch (err) {
      console.log("OpenRouter ERROR:", err.response?.data || err.message);
      return res.status(500).json({ message: "AI API failed" });
    }

    const raw   = aiResponse.data?.choices?.[0]?.message?.content || "";
    if (!raw)   return res.status(500).json({ message: "Empty AI response" });

    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end   = clean.lastIndexOf("}");
    if (start === -1 || end === -1) return res.status(500).json({ message: "Invalid AI format" });

    let parsed;
    try {
      parsed = JSON.parse(clean.slice(start, end + 1));
    } catch (e) {
      return res.status(500).json({ message: "Invalid JSON from AI" });
    }

    const validQuestions = (parsed.questions || []).filter(
      (q) => q.question && Array.isArray(q.options) && q.options.length === 4 && q.answer && q.options.includes(q.answer)
    );

    if (!validQuestions.length) return res.status(500).json({ message: "AI did not generate valid questions. Try again." });

    const normalized = validQuestions.map((q) => ({
      question:       q.question.trim(),
      options:        q.options.map((o) => o.trim()),
      answer:         q.answer.trim(),
      suggestedMarks: Number(q.suggestedMarks) || 1,
    }));

    res.json({ questions: normalized });
  } catch (err) {
    console.error("suggestQuestions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── CREATE QUIZ ──────────────────────────────────────────────────────────────
const createQuiz = async (req, res) => {
  try {
    const { classroomId, materialId, title, description, deadline, questions } = req.body;

    if (!classroomId || !materialId || !title || !deadline || !questions?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || q.suggestedMarks || 1), 0);

    const quiz = await Quiz.create({
      classroomId,
      materialId,
      title,
      description: description || "",
      deadline,
      questions,
      totalMarks,
      createdBy:        req.user.id,
      answersPublished: false,   // answers always hidden by default
    });

    res.json({ quiz });
  } catch (err) {
    console.error("createQuiz error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── PUBLISH ANSWERS (Teacher only) ──────────────────────────────────────────
// PATCH /quiz/:quizId/publish-answers
const publishAnswers = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can publish answers" });
    }

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Verify the teacher owns this quiz
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorised" });
    }

    quiz.answersPublished = true;
    await quiz.save();

    res.json({ message: "Answers published. Students can now view their results." });
  } catch (err) {
    console.error("publishAnswers error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── SUBMIT QUIZ (Student) ────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const { quizId }  = req.params;
    const { answers } = req.body;

    if (!quizId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Prevent re-submission
    const existing = await QuizSubmission.findOne({ quizId, studentId: req.user.id });
    if (existing) return res.status(400).json({ message: "You have already submitted this quiz." });

    // Grade now — stored in DB regardless, but only shown when teacher publishes
    let totalMarksAwarded = 0;

    const evaluatedAnswers = answers.map((ans) => {
      const q = quiz.questions[ans.questionIndex];
      if (!q) return { questionIndex: ans.questionIndex, selectedOption: ans.selectedOption, isCorrect: false, marksAwarded: 0 };

      const isCorrect     = q.answer.trim().toLowerCase() === (ans.selectedOption || "").trim().toLowerCase();
      const marksAwarded  = isCorrect ? (q.marks || q.suggestedMarks || 1) : 0;
      totalMarksAwarded  += marksAwarded;

      return { questionIndex: ans.questionIndex, selectedOption: ans.selectedOption, isCorrect, marksAwarded };
    });

    const percentage = quiz.totalMarks > 0 ? Math.round((totalMarksAwarded / quiz.totalMarks) * 100) : 0;

    await QuizSubmission.create({
      quizId,
      classroomId:       quiz.classroomId,
      studentId:         req.user.id,
      answers:           evaluatedAnswers,
      totalMarksAwarded,
      totalMarks:        quiz.totalMarks,
      percentage,
      submittedAt:       new Date(),
    });

    // ── KEY: Only reveal result if teacher has ALREADY published answers ─────
    if (quiz.answersPublished === true) {
      return res.status(200).json({
        message:          "Quiz submitted successfully",
        answersPublished: true,
        result: {
          totalMarksAwarded,
          totalMarks:    quiz.totalMarks,
          percentage,
          questions:     quiz.questions,
          gradedAnswers: evaluatedAnswers,
        },
      });
    }

    // Answers not published — confirm submission only, NO score/answers revealed
    return res.status(200).json({
      message:          "Quiz submitted! Your result will be visible once your teacher publishes the answers.",
      answersPublished: false,
      result:           null,
    });
  } catch (err) {
    console.error("submitQuiz error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET QUIZZES BY CLASSROOM ─────────────────────────────────────────────────
const getQuizzesByClassroom = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    const quizzes = await Quiz.find({ classroomId: req.params.classroomId }).populate("materialId", "title");

    const quizzesWithSubmissions = await Promise.all(
      quizzes.map(async (quiz) => {
        const quizObj = quiz.toObject();

        // ── Teacher sees everything as-is ─────────────────────────────────
        if (role === "Teacher") {
          // Count submissions for teacher view
          const submissionCount = await QuizSubmission.countDocuments({ quizId: quiz._id });
          return {
            ...quizObj,
            isExpired: new Date(quiz.deadline) < new Date(),
            submissionCount,
          };
        }

        // ── Student view ──────────────────────────────────────────────────
        // IMPORTANT: Strip the correct answers from questions before sending to student
        // so answers can never be extracted from the network response
        const safeQuestions = quizObj.questions.map((q) => ({
          question: q.question,
          options:  q.options,
          marks:    q.marks,
          // answer field intentionally omitted — only sent after answersPublished
        }));

        const base = {
          ...quizObj,
          // Only include correct answers in questions if answers are published
          questions:        quiz.answersPublished ? quizObj.questions : safeQuestions,
          isExpired:        new Date(quiz.deadline) < new Date(),
          submission:       null,
        };

        const submission = await QuizSubmission.findOne({ quizId: quiz._id, studentId: userId });
        if (!submission) return base;

        // Student has submitted — only expose graded details if answers published
        if (quiz.answersPublished === true) {
          base.submission = {
            _id:               submission._id,
            submittedAt:       submission.submittedAt,
            totalMarksAwarded: submission.totalMarksAwarded,
            totalMarks:        submission.totalMarks,
            percentage:        submission.percentage,
            answers:           submission.answers, // includes isCorrect per question
            pending:           false,
          };
        } else {
          // Answers NOT published — only confirm they submitted, no score/answers
          base.submission = {
            _id:         submission._id,
            submittedAt: submission.submittedAt,
            pending:     true,
            // totalMarksAwarded, percentage, answers intentionally omitted
          };
        }

        return base;
      })
    );

    res.json({ quizzes: quizzesWithSubmissions });
  } catch (err) {
    console.error("getQuizzesByClassroom error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET SUBMISSIONS (Teacher) ────────────────────────────────────────────────
const getSubmissions = async (req, res) => {
  try {
    const submissions = await QuizSubmission.find({ quizId: req.params.quizId })
      .populate("studentId", "name email");

    // Also return the quiz so teacher can see answersPublished status
    const quiz = await Quiz.findById(req.params.quizId).select("answersPublished title totalMarks");

    res.json({ submissions, quiz });
  } catch (err) {
    console.error("getSubmissions error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  res.json({ quiz });
};

const deleteQuiz = async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.quizId);
  await QuizSubmission.deleteMany({ quizId: req.params.quizId });
  res.json({ message: "Deleted" });
};

module.exports = {
  suggestQuestions,
  createQuiz,
  publishAnswers,
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
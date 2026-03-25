const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const Material = require("../models/Material");
const axios = require("axios");

// ── SUGGEST QUESTIONS ────────────────────────────────────────────────────────
const suggestQuestions = async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can use this" });
    }

    const { materialId } = req.body;
    if (!materialId) {
      return res.status(400).json({ message: "materialId is required" });
    }

    const material = await Material.findById(materialId).lean();
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    let fileContent = null;

    // ✅ PDF parsing (safe)
    if (material.fileType === "pdf" && material.fileUrl) {
      try {
        const pdfParse = require("pdf-parse");

        const pdfRes = await axios.get(material.fileUrl, {
          responseType: "arraybuffer",
          timeout: 10000,
        });

        const data = await pdfParse(pdfRes.data);
        fileContent = data.text.slice(0, 2000);
      } catch (err) {
        console.error("PDF error:", err.message);
      }
    }

    const contentBlock = fileContent
      ? `Content:\n${fileContent}`
      : `Topic: ${material.title}`;

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
          model: "meta-llama/llama-3-8b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1200,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );
    } catch (err) {
      console.log("OpenRouter ERROR:", err.response?.data || err.message);
      return res.status(500).json({ message: "AI API failed" });
    }

    const raw = aiResponse.data?.choices?.[0]?.message?.content || "";

    if (!raw) {
      return res.status(500).json({ message: "Empty AI response" });
    }

    // ✅ Clean JSON
    const clean = raw.replace(/```json|```/g, "").trim();

    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return res.status(500).json({ message: "Invalid AI format" });
    }

    let parsed;
    try {
      parsed = JSON.parse(clean.slice(start, end + 1));
    } catch (e) {
      console.log("JSON parse error:", e.message);
      return res.status(500).json({ message: "Invalid JSON from AI" });
    }

    // ✅ Validate questions
    const validQuestions = (parsed.questions || []).filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.answer &&
        q.options.includes(q.answer)
    );

    if (!validQuestions.length) {
      return res.status(500).json({
        message: "AI did not generate valid questions. Try again.",
      });
    }

    // ✅ Normalize
    const normalized = validQuestions.map((q) => ({
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      answer: q.answer.trim(),
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
    const { classroomId, materialId, title, deadline, questions } = req.body;

    if (!classroomId || !materialId || !title || !deadline || !questions?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const totalMarks = questions.reduce(
      (sum, q) => sum + (q.suggestedMarks || 1),
      0
    );

    const quiz = await Quiz.create({
      classroomId,
      materialId,
      title,
      deadline,
      questions,
      totalMarks,
      createdBy: req.user.id,
    });

    res.json({ quiz });

  } catch (err) {
    console.error("createQuiz error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── SUBMIT QUIZ ──────────────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;  // ✅ from URL
    const { answers } = req.body;

    if (!quizId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let totalMarksAwarded = 0;

    const evaluatedAnswers = answers.map((ans) => {
      const q = quiz.questions[ans.questionIndex];

      if (!q) {
        return {
          questionIndex: ans.questionIndex,
          selectedOption: ans.selectedOption,
          isCorrect: false,
          marksAwarded: 0,
        };
      }

      const isCorrect =
        q.answer.trim().toLowerCase() ===
        (ans.selectedOption || "").trim().toLowerCase();

      const marksAwarded = isCorrect ? (q.suggestedMarks || 1) : 0;
      totalMarksAwarded += marksAwarded;

      return {
        questionIndex: ans.questionIndex,
        selectedOption: ans.selectedOption,
        isCorrect,
        marksAwarded,
      };
    });

    const percentage =
      quiz.totalMarks > 0
        ? Math.round((totalMarksAwarded / quiz.totalMarks) * 100)
        : 0;

    const submission = await QuizSubmission.findOneAndUpdate(
      { quizId, studentId: req.user.id },
      {
        quizId,
        classroomId: quiz.classroomId,
        studentId: req.user.id,
        answers: evaluatedAnswers,
        totalMarksAwarded,
        totalMarks: quiz.totalMarks,
        percentage,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // ✅ Return everything the frontend needs
    res.status(200).json({
      message: "Quiz submitted successfully",
      submission,
      result: {
        totalMarksAwarded,
        totalMarks: quiz.totalMarks,
        percentage,
        questions: quiz.questions,
        gradedAnswers: evaluatedAnswers,
      },
    });

  } catch (err) {
    console.error("submitQuiz error:", err);
    res.status(500).json({ message: err.message });
  }
};
//------------- CONTROLLERS ────────────────────────────────────────────────────────
const getQuizzesByClassroom = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ classroomId: req.params.classroomId });

    // ✅ Attach each student's own submission to each quiz
    const quizzesWithSubmissions = await Promise.all(
      quizzes.map(async (quiz) => {
        const submission = await QuizSubmission.findOne({
          quizId: quiz._id,
          studentId: req.user.id,
        });

        return {
          ...quiz.toObject(),
          isExpired: new Date(quiz.deadline) < new Date(),
          submission: submission || null,
        };
      })
    );

    res.json({ quizzes: quizzesWithSubmissions });
  } catch (err) {
    console.error("getQuizzesByClassroom error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  res.json({ quiz });
};

const getSubmissions = async (req, res) => {
  try {
    const submissions = await QuizSubmission.find({ quizId: req.params.quizId })
      .populate("studentId", "name email");  // ✅ populate name and email

    res.json({ submissions });
  } catch (err) {
    console.error("getSubmissions error:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteQuiz = async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.quizId);
  res.json({ message: "Deleted" });
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
const Material = require("../models/Material");
const Classroom = require("../models/Classroom");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Extract text based on file type
const extractText = async (filePath, fileType) => {
  const fileBuffer = fs.readFileSync(filePath);

  if (fileType === "PDF") {
    // Use pdf-parse for PDF
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  if (fileType === "PPT") {
    // PPT text extraction — return message
    return null;
  }

  return null;
};

// POST /api/summarize — Student requests summary
const summarizeMaterial = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students can summarize" });
    }

    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({ message: "materialId is required" });
    }

    // Get material from DB
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Check student is enrolled in classroom
    const classroom = await Classroom.findById(material.classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isEnrolled = classroom.members.some(
      (m) => m.toString() === req.user.id
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: "Not enrolled in this classroom" });
    }

    // Read file path
    const filePath = path.join(__dirname, "../uploads", material.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Only PDF supported right now
    if (material.fileType !== "PDF") {
      return res.status(400).json({
        message: "Summarization is currently supported for PDF files only. PPT and DOC support coming soon.",
      });
    }

    // Extract text
    const text = await extractText(filePath, material.fileType);

    if (!text || text.trim().length < 100) {
      return res.status(400).json({
        message: "Not enough readable text in this file to summarize",
      });
    }

    // Trim to avoid HuggingFace token limit
    const trimmedText = text.trim().substring(0, 3000);
    // Call Hugging Face API
    const hfResponse = await axios.post(
      "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
      { inputs: trimmedText },
      {
        headers: {
          Authorization: "Bearer " + process.env.HF_TOKEN,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const summary = hfResponse.data[0]?.summary_text;

    if (!summary) {
      return res.status(500).json({ message: "Could not generate summary — try again" });
    }

    res.status(200).json({ summary });
  } catch (err) {
    console.error("Summarize error:", err.message);

    // HuggingFace model loading error
    if (err.response?.status === 503) {
      return res.status(503).json({
        message: "AI model is loading — please wait 20 seconds and try again",
      });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { summarizeMaterial };
// const Material = require("../models/Material");
// const Classroom = require("../models/Classroom");
// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");

// // Extract text based on file type

// const extractText = async (filePath, fileType) => {
//   try {
//     const fileBuffer = fs.readFileSync(filePath);

//     if (fileType.toUpperCase() === "PDF") {
//       const pdfParse = require("pdf-parse");
//       const data = await pdfParse(fileBuffer);
//       return data.text;
//     }
//     return null;
//   } catch (err) {
//     console.error("Text extraction error:", err.message);
//     return null;
//   }
// };
// // POST /api/summarize — Student requests summary
// const summarizeMaterial = async (req, res) => {
//   try {
//     if (req.user.role !== "Student") {
//       return res.status(403).json({ message: "Only students can summarize" });
//     }

//     const { materialId } = req.body;

//     if (!materialId) {
//       return res.status(400).json({ message: "materialId is required" });
//     }

//     // Get material from DB
//     const material = await Material.findById(materialId);
//     if (!material) {
//       return res.status(404).json({ message: "Material not found" });
//     }

//     // Check student is enrolled in classroom
//     const classroom = await Classroom.findById(material.classroomId);
//     if (!classroom) {
//       return res.status(404).json({ message: "Classroom not found" });
//     }

//     const isEnrolled = classroom.members.some(
//       (m) => m.toString() === req.user.id
//     );

//     if (!isEnrolled) {
//       return res.status(403).json({ message: "Not enrolled in this classroom" });
//     }

//     // Read file path
//     const filePath = path.join(__dirname, "../uploads", material.filePath);
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ message: "File not found on server" });
//     }

//     // Only PDF supported right now
//     if (material.fileType.toUpperCase() !== "PDF") {
//       return res.status(400).json({
//         message: "Summarization is currently supported for PDF files only. PPT and DOC support coming soon.",
//       });
//     }

//     // Extract text
//     const text = await extractText(filePath, material.fileType);

//     if (!text || text.trim().length ==0) {
//       return res.status(400).json({
//         message: "Not enough readable text in this file to summarize",
//       });
//     }

//     // Trim to avoid HuggingFace token limit
//     const trimmedText = text.trim().substring(0, 3000);
//     // Call Hugging Face API
//     const hfResponse = await axios.post(
//       "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
//       { inputs: trimmedText },
//       {
//         headers: {
//           Authorization: "Bearer " + process.env.HF_TOKEN,
//           "Content-Type": "application/json",
//         },
//         timeout: 30000,
//       }
//     );

//     const summary = hfResponse.data[0]?.summary_text;

//     if (!summary) {
//       return res.status(500).json({ message: "Could not generate summary — try again" });
//     }

//     res.status(200).json({ summary });
//   } catch (err) {
//     console.error("Summarize error:", err.message);

//     // HuggingFace model loading error
//     if (err.response?.status === 503) {
//       return res.status(503).json({
//         message: "AI model is loading — please wait 20 seconds and try again",
//       });
//     }

//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// module.exports = { summarizeMaterial };




const Material = require("../models/Material");
const Classroom = require("../models/Classroom");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const unzipper = require("unzipper");
const xml2js = require("xml2js");
const https = require("https");

const extractPPTText = async (filePath) => {
  try {
    const texts = [];
    const zip = await unzipper.Open.file(filePath);

    const slideFiles = zip.files.filter(
      (f) => f.path.startsWith("ppt/slides/slide") && f.path.endsWith(".xml")
    );

    for (const slideFile of slideFiles) {
      const content = await slideFile.buffer();
      const parsed = await xml2js.parseStringPromise(content.toString());
      const json = JSON.stringify(parsed);
      const matches = json.match(/"t":"([^"]+)"/g);
      if (matches) {
        matches.forEach((m) => {
          const text = m.replace(/"t":"/, "").replace(/"$/, "");
          if (text.trim()) texts.push(text.trim());
        });
      }
    }

    return texts.join(" ");
  } catch (err) {
    console.error("PPT extract error:", err.message);
    return null;
  }
};


// Cloudinary URL se file buffer download karo
const downloadBuffer = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
};
const extractText = async (buffer, fileType) => {
  try {
    const type = fileType.toUpperCase();

    if (type === "PDF") {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (type === "PPT" || type === "PPTX") {
      // Buffer se temp file banao PPT ke liye
      const tmp = path.join(__dirname, "../uploads", `temp_${Date.now()}.pptx`);
      fs.writeFileSync(tmp, buffer);
      const text = await extractPPTText(tmp);
      fs.unlinkSync(tmp); // cleanup
      return text;
    }

    if (type === "DOC" || type === "DOCX") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    return null;
  } catch (err) {
    console.error("Text extraction error:", err.message);
    return null;
  }
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

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

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

    
    if (!material.fileUrl) {
      return res.status(404).json({ message: "File URL not found" });
    }
    const buffer = await downloadBuffer(material.fileUrl);
    const text = await extractText(buffer, material.fileType);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "Could not extract text from this file",
      });
    }

    // Increased to 5000 chars for better summary
    const trimmedText = text.trim().substring(0, 3000);

    const hfResponse = await axios.post(
      "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6",
      {
        inputs: trimmedText,
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.HF_TOKEN,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const summary = hfResponse.data[0]?.summary_text;

    if (!summary) {
      return res.status(500).json({ message: "Could not generate summary — try again" });
    }

    res.status(200).json({ summary });
  } catch (err) {
    console.error("Summarize error:", err.message);
    console.error("HF Response data:", err.response?.data);
    console.error("HF Status:", err.response?.status);

    if (err.response?.status === 503) {
      return res.status(503).json({
        message: "AI model is loading — please wait 20 seconds and try again",
      });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { summarizeMaterial };
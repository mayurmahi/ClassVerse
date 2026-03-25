const express = require("express");
const router = express.Router();
const axios = require("axios");
const Material = require("../models/Material");

// View route — PEHLE hona chahiye
router.get("/view/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Not found" });

    const pdfUrl = material.fileUrl.replace('/raw/upload/', '/image/upload/') + '.pdf';
    const response = await axios.get(pdfUrl, { responseType: "stream" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${material.title}.pdf"`);

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "View failed", error: err.message });
  }
});

// Download route — BAAD MEIN hona chahiye
router.get("/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Not found" });

    const response = await axios.get(material.fileUrl, { responseType: "stream" });

    const contentTypes = {
      pdf:  "application/pdf",
      doc:  "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ppt:  "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    };

    const contentType = contentTypes[material.fileType?.toLowerCase()] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${material.title}.${material.fileType.toLowerCase()}"`);

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
});

module.exports = router;
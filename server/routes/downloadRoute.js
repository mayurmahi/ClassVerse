const express = require("express");
const router = express.Router();
const axios = require("axios");
const Material = require("../models/Material");

// Download route
router.get("/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Not found" });

    const response = await axios.get(material.fileUrl, { responseType: "stream" });

    res.setHeader("Content-Disposition", `attachment; filename="${material.title}.${material.fileType.toLowerCase()}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
});

// View route
router.get("/view/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Not found" });

    const response = await axios.get(material.fileUrl, { responseType: "stream" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(material.title)}.${material.fileType.toLowerCase()}"`);
    res.setHeader("Title", material.title);

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "View failed", error: err.message });
  }
});

module.exports = router;
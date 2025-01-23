const express = require("express");
const router = express.Router();
const path = require("path");
const upload = require("../utils/upload");

// Endpoint to upload an image
router.post("/", upload.single("image"), (req, res) => {
  console.log("req.file", req.file);
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Generate the file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    console.log("File uploaded successfully:", fileUrl);
    return res.status(200).json({ success: true, fileUrl });
  } catch (err) {
    console.error("Error uploading file:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

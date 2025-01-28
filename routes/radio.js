const express = require("express");
const {
  createTvAndRadio,
  getAllTvAndRadio,
  getTvAndRadioById,
  updateTvAndRadio,
  deleteTvAndRadio,
} = require("../controllers/tvAndRadioController");
const router = express.Router();

// Routes
router.post("/", createTvAndRadio); // Create a new record
router.get("/", getAllTvAndRadio); // Get all records
router.get("/:id", getTvAndRadioById); // Get a record by ID
router.put("/:id", updateTvAndRadio); // Update a record by ID
router.delete("/:id", deleteTvAndRadio); // Delete a record by ID

module.exports = router;

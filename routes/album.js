const express = require("express");
const {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
} = require("../controllers/albumController");
const router = express.Router();

// Routes
router.post("/", createAlbum); // Create a new album
router.get("/", getAllAlbums); // Get all albums
router.get("/:id", getAlbumById); // Get an album by ID
router.put("/:id", updateAlbum); // Update an album by ID
router.delete("/:id", deleteAlbum); // Delete an album by ID

module.exports = router;

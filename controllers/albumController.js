const Album = require("../models/album");

// Create a new album
exports.createAlbum = async (req, res) => {
  try {
    const newAlbum = new Album(req.body);
    const savedAlbum = await newAlbum.save();
    res.status(201).json(savedAlbum);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all albums
exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find()
      .populate("artists userId") // Populate references for artists and user
      .populate("songs"); // Populate songs (if referenced)
    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single album by ID
exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("artists userId") // Populate references for artists and user
      .populate("songs"); // Populate songs (if referenced)
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.status(200).json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an album
exports.updateAlbum = async (req, res) => {
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate("artists userId") // Populate references for artists and user
      .populate("songs"); // Populate songs (if referenced)
    if (!updatedAlbum) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.status(200).json(updatedAlbum);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an album
exports.deleteAlbum = async (req, res) => {
  try {
    const deletedAlbum = await Album.findByIdAndDelete(req.params.id);
    if (!deletedAlbum) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.status(200).json(deletedAlbum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

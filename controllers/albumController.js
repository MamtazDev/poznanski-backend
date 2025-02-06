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
    const {
      sortBy = "createdAt",  // Default sort field
      order = "asc",          // Default order
      page = 1,               // Default page
      limit = 10,             // Default limit
      search,                 // Search query
      startDate,              // Date range filtering start
      endDate,                // Date range filtering end
      type,                   // Filter type (confirmed or proposed)
    } = req.query;

    // Convert pagination and sorting parameters to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Build query conditions
    const query = {};

    // Apply search on album name, description, and artist
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

 

    // Apply date range filtering if startDate or endDate is provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch total count for pagination metadata
    const totalAlbums = await Album.countDocuments(query);

    // Paginate and sort the albums
    const albums = await Album.find(query)
      .populate(["songs", "userId"])
      .sort({ [sortBy]: sortOrder })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      albums,
      totalAlbums,
      totalPages: Math.ceil(totalAlbums / pageSize),
      currentPage: pageNumber,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
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

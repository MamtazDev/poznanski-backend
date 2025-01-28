const Material = require("../models/material");

// Create a new material
exports.createMaterial = async (req, res) => {
  try {
    const { title, description, youTube, tags, date, commentsSection } =
      req.body;
    if (!title || !description || !youTube || !tags || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const newMaterial = new Material({
      title,
      description,
      youTube,
      tags,
      date,
      commentsSection,
    });
    await newMaterial.save();
    res.status(201).json(newMaterial);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating material.", error: err.message });
  }
};

// Get a single material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found." });
    res.status(200).json(material);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching material.", error: err.message });
  }
};

// Update a material by ID
exports.updateMaterial = async (req, res) => {
  try {
    const updatedMaterial = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMaterial)
      return res.status(404).json({ message: "Material not found." });
    res.status(200).json(updatedMaterial);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating material.", error: err.message });
  }
};

// Delete a material by ID
exports.deleteMaterial = async (req, res) => {
  try {
    const deletedMaterial = await Material.findByIdAndDelete(req.params.id);
    if (!deletedMaterial)
      return res.status(404).json({ message: "Material not found." });
    res.status(200).json({
      message: "Material deleted successfully.",
      material: deletedMaterial,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting material.", error: err.message });
  }
};

// Get all materials
exports.getAllMaterials = async (req, res) => {
  try {
    const {
      sortBy = "createdAt",
      order = "asc",
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = req.query;

    // Parse page and limit into numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Build query conditions
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch materials with sorting, filtering, and pagination
    const materials = await Material.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    // Count total materials for pagination metadata
    const totalMaterials = await Material.countDocuments(query);

    res.status(200).json({
      materials,
      totalMaterials,
      totalPages: Math.ceil(totalMaterials / pageSize),
      currentPage: pageNumber,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching materials.", error: err.message });
  }
};

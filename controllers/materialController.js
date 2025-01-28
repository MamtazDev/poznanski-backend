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
    const materials = await Material.find();
    res.status(200).json(materials);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching materials.", error: err.message });
  }
};

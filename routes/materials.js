const express = require("express");
const router = express.Router();

const {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

// Route to create a new material
router.post("/", createMaterial);

// Route to get all materials
router.get("/", getAllMaterials);

// Route to get a single material by ID
router.get("/:id", getMaterialById);

// Route to update a material by ID
router.put("/:id", updateMaterial);

// Route to delete a material by ID
router.delete("/:id", deleteMaterial);

module.exports = router;

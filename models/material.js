const mongoose = require("mongoose");
const { commentsSectionSchema } = require("./comment");
const Schema = mongoose.Schema;

const materialSchema = new Schema(
  {
    title: { type: String, required: true }, // Title of the material
    description: { type: String, required: true }, // Description of the material
    youTube: { type: String, required: true }, // YouTube link for the material
    tags: { type: String, required: true }, // Tags related to the material
    date: { type: Date, required: false }, // Date related to the material (e.g., creation or event date)
    commentsSection: { type: Array, required: false }, // Comments section schema, which you may have defined elsewhere
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the Material model
const Material = mongoose.model("Material", materialSchema);

module.exports = Material;

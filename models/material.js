const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const materialSchema = new Schema(
  {
<<<<<<< HEAD
    title: { type: String, required: true },
    description: { type: String, required: true },
    youTube: { type: String, required: true }, 
    tags: { type: String, required: true },
    date: { type: Date, required: true },
=======
    title: { type: String, required: true }, // Title of the material
    description: { type: String, required: true }, // Description of the material
    youTube: { type: String, required: true }, // YouTube link for the material
    tags: { type: String, required: true }, // Tags related to the material
    date: { type: Date, required: false }, // Date related to the material (e.g., creation or event date)
    commentsSection: { type: Array, required: false }, // Comments section schema, which you may have defined elsewhere
>>>>>>> 91f4d50b182eb77525efcc2f5b83635a9e81b591
  },
  { timestamps: true }
);

// Create the Material model
const Material = mongoose.model("Material", materialSchema);

module.exports = Material;

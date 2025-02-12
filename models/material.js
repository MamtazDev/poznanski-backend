const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const materialSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    youTube: { type: String, required: true }, 
    tags: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

// Create the Material model
const Material = mongoose.model("Material", materialSchema);

module.exports = Material;

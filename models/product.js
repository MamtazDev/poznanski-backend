const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: true },
  img: { type: String },
  category: { type: String },
  link: { type: String, default: "" },
  date: { type: Date },
  location: { type: String },
  artist: { type: String },
  isFeatured: { type: Boolean, default: false },
  star: { type: Number, default: 0 },
});

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const concertSchema = new Schema({
  name: { type: String, required: true },
  img: { type: String, default: "" },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  link: { type: String, default: "" },
  timeframe: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
});

module.exports = mongoose.model("Concert", concertSchema);

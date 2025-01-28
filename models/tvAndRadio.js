const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema
const tvAndRadioSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    youTube: { type: String, required: true },
    artists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
        required: true,
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: { type: String, required: true },
    date: { type: Date, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String },
    commentsSection: { type: Object }, // Assuming commentsSectionSchema is defined elsewhere
  },
  { timestamps: true }
);

// Create the model
const TvAndRadio = mongoose.model("TvAndRadio", tvAndRadioSchema);

module.exports = TvAndRadio;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Import related schemas if needed

const TvAndRadio = require("./tvAndRadio");
const { Comment, commentsSectionSchema } = require("./comment");

// Define the schema
const albumSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    artists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    songs: [
      {
        type: mongoose.Schema.Types.Object, // For storing inline objects
        ref: "TvAndRadio",
        required: false,
      } || TvAndRadio,
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
    commentsSection: commentsSectionSchema, // Embedded comments schema
  },
  { timestamps: true }
);

// Create and export the model
const Album = mongoose.model("Album", albumSchema);

module.exports = Album;

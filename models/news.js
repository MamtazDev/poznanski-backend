const mongoose = require("mongoose");
const { commentsSectionSchema } = require("./comment");

const Schema = mongoose.Schema;

const FileToSave = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
});

const newsSchema = new Schema(
  {
    title: { type: String, required: false },
    intro: { type: String, required: false },
    content: { type: String, required: false },
    files: [{ type: FileToSave, required: false }],
    nickname: { type: String, required: false },
    email: { type: String, required: false },
    tags: { type: String },
    date: { type: Date },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String },
    commentsSection: commentsSectionSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);

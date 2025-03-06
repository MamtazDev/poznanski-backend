const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const CommentSection = {
  NEWS: "News",
  MATERIAL: "material",
  ARTIST: "audio",
  ARTICLE: "article",
  EVENT: "event",
};

const CommentSchema = new Schema(
  {
    content: { type: String, required: true },
    section: {
      type: String,
      enum: Object.values(CommentSection),
      required: true,
    },
    post: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String },
    website: { type: String },
    email: { type: String },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    likes: {
      type: [Object],
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      date: { type: Date, default: Date.now, required: true },
      default: [],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = model("Comment", CommentSchema, "comments");

module.exports = {
  Comment,
  CommentSection,
};

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const CommentSection = {
  POST: "post",
  PRODUCT: "product",
  VIDEO: "video",
  ARTICLE: "article",
  REVIEW: "review",
};

const CommentSchema = new Schema(
  {
    content: { type: String, required: true },
    section: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = model("Comment", CommentSchema);

module.exports = {
  Comment,
  CommentSection,
};

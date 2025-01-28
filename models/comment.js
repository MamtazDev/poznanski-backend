const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the allowed entity models
const EntityModels = ["News", "Comment", "Artist"];

// Define the reply schema
const replySchema = new Schema(
  {
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityModel: { type: String, required: true, enum: EntityModels },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Define the comment schema
const commentSchema = new Schema(
  {
    entityId: { type: Schema.Types.ObjectId, required: true }, // ID of the associated entity (News, Artist, etc.)
    entityModel: { type: String, required: true, enum: EntityModels }, // Type of entity being commented on
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment" }, // Reference to the parent comment, if any
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // The author of the comment
    content: { type: String, required: true }, // The actual comment text
    embeddedReplies: [replySchema], // Embedded replies directly stored within the comment
    repliesIds: [
      { type: Schema.Types.ObjectId, ref: "Comment", required: false },
    ], // References to replies stored separately
    likes: { type: Number, default: 0 }, // Number of likes on the comment
  },
  { timestamps: true }
);

// Define the comments section schema
const commentsSectionSchema = new Schema(
  {
    embeddedComments: [commentSchema], // Embedded comments directly stored within the section
    commentsIds: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }], // References to comments stored separately
  },
  { _id: false }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Comment, commentsSectionSchema };

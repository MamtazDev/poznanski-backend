const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the allowed entity models
const EntityModels = ['News', 'Comment', 'Artist'];

// Define the reply schema
const replySchema = new Schema(
  {
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityModel: { type: String, required: true, enum: EntityModels },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    content: { type: String, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    embeddedReplies: [{
      type: new Schema({
        entityId: { type: Schema.Types.ObjectId, required: true },
        entityModel: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
      }, {timestamps: true}),
    }],
    repliesIds: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Define the comment schema
const commentSchema = new Schema(
  {
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityModel: { type: String, required: true, enum: EntityModels },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    content: { type: String, required: true },
    embeddedReplies: [replySchema],
    repliesIds: [{ type: Schema.Types.ObjectId, ref: 'Comment', required: false}],
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

// Define the comments section schema
const commentsSectionSchema = new Schema({
  embeddedComments: [commentSchema],
  commentsIds: [{ type: Schema.Types.ObjectId, ref: 'Comment', default: []}],
}, { _id: false });


module.exports = { Comment, commentsSectionSchema };

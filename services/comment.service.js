const { Comment } = require("../models/commenting");

const createCommentService = async (data) => {
  const newComment = new Comment(data);
  return await newComment.save();
};

const getCommentsService = async ({ section, post }) => {
  try {
    console.log("section:", section, "post:", post);

    if (section && post) {
      const comments = await Comment.find({ section, post, parentComment: null, isDeleted: false })
        .populate("user")  // Populate user details
        .sort({ createdAt: -1 });

      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const plainComment = comment.toObject();
          const replies = await Comment.find({ parentComment: comment._id, isDeleted: false })
            .populate("user")
            .sort({ createdAt: 1 });
            plainComment.replies = replies;
          return plainComment;
        })
      );

      console.log("commentsWithReplies:", commentsWithReplies);

      return commentsWithReplies;
    }

    // if (section && post) {
    //   const commentsWithReplies = await Comment.aggregate([
    //     {
    //       // Match only parent comments
    //       $match: {
    //         section,
    //         post,
    //         parentComment: null,
    //         isDeleted: false,
    //       },
    //     },
    //     {
    //       // Lookup replies for each comment
    //       $lookup: {
    //         from: "comments", // Collection name (MongoDB is case-sensitive here)
    //         localField: "_id",
    //         foreignField: "parentComment",
    //         as: "replies", // Replies will be attached as an array
    //       },
    //     },
    //     {
    //       // Optionally sort replies by creation date (ascending)
    //       $addFields: {
    //         replies: { $sortArray: { input: "$replies", sortBy: { createdAt: 1 } } },
    //       },
    //     },
    //     {
    //       // Populate user details for the parent comment
    //       $lookup: {
    //         from: "users",
    //         localField: "user",
    //         foreignField: "_id",
    //         as: "user",
    //       },
    //     },
    //     {
    //       // Unwind the user array (because populate will return an array)
    //       $unwind: "$user",
    //     },
    //     {
    //       // Sort parent comments by creation date (descending)
    //       $sort: { createdAt: -1 },
    //     },
    //   ]);

    //   console.log("commentsWithReplies:", commentsWithReplies);
    //   return commentsWithReplies;
    // }


    return await Comment.find({ isDeleted: false })
      .populate("user")
      .sort({ createdAt: -1 });

  } catch (error) {
    throw new Error(`Error fetching comments: ${error.message}`);
  }
};


const deleteCommentService = async (id) => {
  return await Comment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

module.exports = {
  createCommentService,
  getCommentsService,
  deleteCommentService,
};

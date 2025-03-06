const { Notification_Constants } = require("../consts/notification.constant");
const artist = require("../models/artist");
const { Comment } = require("../models/commenting");
const Material = require("../models/material");
const news = require("../models/news");
const { deleteCommentService } = require("../services/comment.service");
const { getCommentsService } = require("../services/comment.service");
const { createCommentService } = require("../services/comment.service");
const { makeNotification } = require("../services/notification.service");

const CommentSection = {
  NEWS: "News",
  MATERIAL: "material",
  ARTIST: "audio",
  ARTICLE: "article",
  EVENT: "event",
};

// const createCodsfdmment = async (req, res) => {
//   try {
//     const { content, section, post, user } = req.body;

//     // Ensure section and post are provided
//     if (!section || !post) {
//       return res.status(400).json({ message: "Section and post are required" });
//     }

//     // Optionally validate that `section` is valid
//     if (!Object.values(CommentSection).includes(section)) {
//       return res.status(400).json({ message: "Invalid section" });
//     }

//     const newComment = await createCommentService({
//       content,
//       section,
//       post,
//       user,
//       ...req.body,
//     });

//     res
//       .status(201)
//       .json({ message: "Comment created successfully", newComment });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const createComment = async (req, res) => {
  try {
    const {
      content = "",
      section = "",
      post = "",
      user = "",
      name = "",
      website = "",
      email = "",
      parentComment = "",
    } = req.body;
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User is required" });
    }

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required" });
    }

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post is required" });
    }

    if (!section) {
      return res
        .status(400)
        .json({ success: false, message: "Section is required" });
    }

    // Optionally validate that `section` is valid
    if (!Object.values(CommentSection).includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    let receiverId = "67bffa39b425d9760f82b94a"; // Default: admin id
    let type = Notification_Constants.Notification_Types.General;
    let notificationTitle = "New Notification";
    let targetType = "";

    if (section === CommentSection.NEWS) {
      type = Notification_Constants.Notification_Types.News;
      notificationTitle = "New News Comment";
      // const postRes = await news.findById(post).select("user");
      // receiverId = postRes.user.toString();
    } else if (section === CommentSection.ARTIST) {
      type = Notification_Constants.Notification_Types.Artist;
      notificationTitle = "New Album Comment";
      // const postRes = await artist.findById(post).select("user");
      // receiverId = postRes.user.toString();
    } else if (section === CommentSection.MATERIAL) {
      type = Notification_Constants.Notification_Types.Material;
      notificationTitle = "New Material Comment";
      // const postRes = await Material.findById(post).select("user");
      // receiverId = postRes.user.toString();
    } else if (section === CommentSection.EVENT) {
      type = Notification_Constants.Notification_Types.Event;
      notificationTitle = "New Event Comment";
    }

    if (section === CommentSection.NEWS) {
      targetType = Notification_Constants.Notification_Target_Types.News;
    } else if (section === CommentSection.ARTIST) {
      targetType = Notification_Constants.Notification_Target_Types.Album;
    } else if (section === CommentSection.MATERIAL) {
      targetType = Notification_Constants.Notification_Target_Types.Material;
    } else if (section === CommentSection.ARTICLE) {
      targetType = Notification_Constants.Notification_Target_Types.Article;
    } else if (section === CommentSection.EVENT) {
      targetType = Notification_Constants.Notification_Target_Types.Event;
    } else if (section === CommentSection.ALBUM) {
      targetType = Notification_Constants.Notification_Target_Types.Album;
    } else if (section === CommentSection.RADIO) {
      targetType = Notification_Constants.Notification_Target_Types.Radio;
    }

    const newCommentData = {
      content: content,
      section: section,
      post: post,
      user: user,
      name: name,
      website: website,
      email: email,
    };

    if (parentComment) {
      newCommentData.parentComment = parentComment;
      const parentCommentData = await Comment.findById(parentComment);
      if (!parentCommentData) {
        return res
          .status(400)
          .json({ success: false, message: "Parent comment not found" });
      }

      const parentCommentUserId = parentCommentData.user.toString();
      if (parentCommentUserId && targetType) {
        const parentNotifyTitle = `${name} reply on your comment`;
        await makeNotification(
          parentNotifyTitle,
          parentCommentUserId,
          user,
          Notification_Constants.Notification_Types.General,
          post,
          targetType
        );
      }
    }

    const newComment = new Comment(newCommentData);
    await newComment.save();

    await makeNotification(
      notificationTitle,
      receiverId,
      user,
      type,
      post,
      targetType
    );
    return res.json({
      success: true,
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { section, post } = req.query;
    console.log("section:", section, post);

    if (!section || !post) {
      return res.status(400).json({ message: "Section and post are required" });
    }

    if (!Object.values(CommentSection).includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    const comments = await getCommentsService({ section, post });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await deleteCommentService(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    res.status(200).json({ message: "Comment deleted successfully", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete comment by id
const deleteCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Comment id is required" });

    // First find the comment to be deleted
    const comment = await Comment.findById(id);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    // Delete all nested comments recursively
    // Recursive function to get all nested comment IDs
    const getNestedCommentIds = async (commentId) => {
      const childComments = await Comment.find({ parentComment: commentId });
      let allIds = [commentId];

      for (const child of childComments) {
        const nestedIds = await getNestedCommentIds(child._id);
        allIds = allIds.concat(nestedIds);
      }

      return allIds;
    };

    // Get all nested comment IDs and delete them
    const commentIdsToDelete = await getNestedCommentIds(id);
    await Comment.deleteMany({ _id: { $in: commentIdsToDelete } });

    res.status(200).json({
      success: true,
      message: "Comment and all nested replies deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get comments by post id
const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch total count for pagination
    // const totalComments = await Comment.countDocuments({ post: postId });

    // Fetch all comments related to the post (including all replies)
    const comments = await Comment.find({ post: postId })
      // .populate("user", "name") // Populate user details
      .sort({ _id: -1 })
      .lean();

    // Structure comments with replies
    const commentMap = new Map();
    const rootComments = [];

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap.set(comment._id.toString(), comment);
    });

    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap.get(comment.parentComment.toString());
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    // Apply pagination to root comments only
    const paginatedComments = rootComments.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedComments,
      pagination: {
        total: rootComments.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(rootComments.length / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const comment = await Comment.findById({ _id: commentId });
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const userIndex = comment.likes.findIndex(
      (like) => like.user.toString() === userId
    );
    if (userIndex !== -1) {
      // User already liked the comment, remove the like
      comment.likes.splice(userIndex, 1);
    } else {
      // User hasn't liked the comment, add a new like
      comment.likes.push({ user: userId, date: new Date() });
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment liked/unliked successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking comment",
      error: error.message,
    });
  }
};
module.exports = {
  createComment,
  getComments,
  deleteComment,
  deleteCommentById,
  getCommentsByPostId,
  likeComment,
};

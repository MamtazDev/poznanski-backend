const { Comment } = require("../models/commenting");

const createCommentService = async (data) => {
  const { content, section, user, parentComment } = data;

  const newComment = new Comment({
    content,
    section,
    user,
    parentComment: parentComment || null,
  });

  return await newComment.save();
};

const getCommentsService = async (section) => {
    try {
      console.log("section:", section);
  
      // If section is provided, filter comments based on that section
      if (section) {
        return await Comment.find({ section }).populate("user");
      }
  
      // If no section is provided, return all comments
      return await Comment.find({}).populate("user");
  
    } catch (error) {
      throw new Error(`Error fetching comments: ${error.message}`);
    }
}


const deleteCommentService = async (id) => {
  return await Comment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

module.exports = {
  createCommentService,
  getCommentsService,
  deleteCommentService,
};

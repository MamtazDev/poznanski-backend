const { deleteCommentService } = require("../services/comment.service");
const { getCommentsService } = require("../services/comment.service");
const { createCommentService } = require("../services/comment.service");

const CommentSection = {
	NEWS: "News",
	MATERIAL: "material",
	ARTIST: "audio",
	ARTICLE: "article",
	EVENT: "event",
  };

  

const createComment = async (req, res) => {
	try {
	  const { content, section, post, user } = req.body;
  
	  // Ensure section and post are provided
	  if (!section || !post) {
		return res.status(400).json({ message: "Section and post are required" });
	  }
  
	  // Optionally validate that `section` is valid
	  if (!Object.values(CommentSection).includes(section)) {
		return res.status(400).json({ message: "Invalid section" });
	  }
  
	  const newComment = await createCommentService({
		content,
		section,
		post,
		user,
		...req.body,
	  });
  
	  res.status(201).json({ message: "Comment created successfully", newComment });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  };


  
  const getComments = async (req, res) => {
	try {
	  const { section, post } = req.query;
	  console.log("section:",section, post );
  
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
  
  module.exports = {
	createComment,
	getComments,
	deleteComment,
  };

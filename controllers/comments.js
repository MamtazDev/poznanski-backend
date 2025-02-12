const { deleteCommentService } = require("../services/comment.service");
const { getCommentsService } = require("../services/comment.service");
const { createCommentService } = require("../services/comment.service");


  const createComment = async (req, res) => {
	try {
	  const newComment = await createCommentService(req.body);
	  res.status(201).json({ message: "Comment created successfully", newComment });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  };
  
  const getComments = async (req, res) => {
	try {
	  const { section } = req.query; // Access the section from query params
  
	  // Ensure section exists before querying
	  if (!section) {
		return res.status(400).json({ message: "Section is required" });
	  }
  
	  const comments = await getCommentsService(section); // Pass the section to the service
	  res.status(200).json(comments); // Send the response with comments
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

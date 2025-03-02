const express = require("express");
const {
  createComment,
  getComments,
  deleteComment,
  getCommentsByPostId,
  deleteCommentById,
} = require("../controllers/comments");

const router = express.Router();

router.post("/create", createComment);
router.get("/", getComments);
router.delete("/:id", deleteComment);
router.delete("/delete/:id", deleteCommentById);
router.get("/post/:postId", getCommentsByPostId);

module.exports = router;

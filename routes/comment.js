const express = require("express");
const { createComment, getComments, deleteComment } = require("../controllers/comments");


const router = express.Router();

router.post("/", createComment); // Create a new comment
router.get("/", getComments); // Get replies of a comment
router.delete("/:id", deleteComment); // Soft delete a comment

module.exports = router;

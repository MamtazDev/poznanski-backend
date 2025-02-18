const express = require("express");
const { createComment, getComments, deleteComment } = require("../controllers/comments");


const router = express.Router();

router.post("/", createComment);
router.get("/", getComments);
router.delete("/:id", deleteComment);

module.exports = router;

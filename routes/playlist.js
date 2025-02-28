const express = require("express");
const router = express.Router();

const {
  reloadAllPlaylist,
  getAllPlaylistsWithPagination,
  getPlaylistsWithPagination,
} = require("../controllers/playlist");

router.post("/reload", reloadAllPlaylist);
router.get("/", getAllPlaylistsWithPagination);
router.get("/:id", getPlaylistsWithPagination);

module.exports = router;

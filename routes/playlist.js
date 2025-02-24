const express = require("express");
const router = express.Router();

const {
  reloadAllPlaylist,
  getAllPlaylistsWithPagination,
} = require("../controllers/playlist");

router.post("/reload", reloadAllPlaylist);
router.get("/", getAllPlaylistsWithPagination);

module.exports = router;

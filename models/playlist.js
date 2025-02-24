const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, required: false },
    videoId: { type: String, required: false },
    channelId: { type: String, required: false },
    channelTitle: { type: String, required: false },
    playlistId: { type: String, required: false },
    publishedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
    timeseries: true,
  }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;

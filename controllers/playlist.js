const axios = require("axios");
const Playlist = require("../models/playlist");

const API_KEY = "AIzaSyBmYFEkoJIVhA4vD7hqWU3M7bf7djo-9rA";
const CHANNEL_USERNAME = "poznanskirapcom";

const fetchAllChannelVideos = async () => {
  try {
    // Krok 1: Pobierz ID kanału na podstawie nazwy użytkownika
    const channelResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          part: "contentDetails",
          forUsername: CHANNEL_USERNAME,
          key: API_KEY,
        },
      }
    );
    const channelId = channelResponse.data.items[0]?.id;

    if (!channelId) {
      console.error("Nie znaleziono kanału");
      return;
    }

    // Krok 2: Pobierz ID playlisty przesłanych filmów (uploads)
    const uploadsPlaylistId =
      channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    let allVideos = [];
    let nextPageToken = "";

    // Krok 3: Pobierz wszystkie filmy z playlisty uploads
    do {
      const uploadsResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
          params: {
            part: "snippet",
            playlistId: uploadsPlaylistId,
            // maxResults: 50, // Maksymalna liczba filmów na stronę
            pageToken: nextPageToken,
            key: API_KEY,
          },
        }
      );

      const videosBatch = uploadsResponse.data.items.map((item) => ({
        title: item.snippet.title,
        description: item.snippet.description,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        playlistId: item.snippet.playlistId,
        publishedAt: item.snippet.publishedAt,
      }));

      allVideos = [...allVideos, ...videosBatch];
      nextPageToken = uploadsResponse.data.nextPageToken;
    } while (nextPageToken);

    return allVideos;
  } catch (error) {
    console.error("Błąd przy pobieraniu filmów z kanału:", error);
    return null;
  }
};

// Service function for inserting multiple playlists
exports.reloadAllPlaylist = async (req, res) => {
  try {
    const playlistData = await fetchAllChannelVideos();
    if (playlistData) {
      const items = playlistData;
      await Playlist.deleteMany({});
      await Playlist.insertMany(items);
      res.status(200).json({
        success: true,
        message: "Playlist save successfully",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Playlist save failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Playlist save failed",
      error: error.message,
    });
  }
};

exports.getAllPlaylistsWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const playlists = await Playlist.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Playlist.countDocuments();

    res.status(200).json({
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
      data: playlists,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to retrieve playlists: ${error.message}` });
  }
};

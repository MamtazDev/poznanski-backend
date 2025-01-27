const express = require("express");
const Artist = require("../models/artist.js");
const Product = require("../models/product.js");
const news = require("../models/news.js");
const concert = require("../models/concert.js");

const router = express.Router();
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }

    // Search Artists by `description` and `name`
    const artists = await Artist.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    // Search Artists by `description` and `name`
    const Concert = await concert.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    // Search Products by `title`
    const products = await Product.find({
      title: { $regex: query, $options: "i" },
    });

    // Search News by `title` and `intro`
    const newsData = await news.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { intro: { $regex: query, $options: "i" } },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        artists,
        products,
        newsData,
        Concert,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});

module.exports = router;

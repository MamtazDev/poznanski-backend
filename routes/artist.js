const express = require("express");
const Artist = require("../models/artist.js");
const Product = require("../models/product.js");
const { publicUrl, filePath } = require("../consts/constant.js");
const { saveImage } = require("../consts/saveImage.js");
const TvAndRadio = require("../models/tvAndRadio.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      rowsPerPage = 10, // Default rows per page
      curPage = 1, // Default to the first page
      filter = "", // Default to no filter
      sortField = "star", // Default sorting field
      sortOrder = -1, // Default sorting order (descending)
    } = req.query;

    const limit = parseInt(rowsPerPage, 10);
    const skip = limit * (parseInt(curPage, 10) - 1);

    // Build query for artists based on the filter
    const artistQuery = filter
      ? { name: { $regex: filter, $options: "i" } }
      : {};

    // Fetch paginated artists and total count in parallel
    const [artists, totalArtists] = await Promise.all([
      Artist.find(artistQuery)
        .sort({ [sortField]: parseInt(sortOrder, 10) }) // Dynamic sorting
        .skip(skip)
        .limit(limit),
      Artist.countDocuments(artistQuery), // Total matching artists
    ]);

    // Prepare the data with related products
    const data = await Promise.all(
      artists.map(async (artist) => {
        const products = await TvAndRadio.find({ artists: artist._id }).limit(
          8
        );
        return {
          artist,
          products,
        };
      })
    );

    // Send the response
    return res.status(200).json({
      data,
      total: totalArtists,
      currentPage: parseInt(curPage, 10),
      totalPages: Math.ceil(totalArtists / limit),
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.get("/data", async (req, res) => {
  try {
    const { rowsPerPage, curPage, filter } = req.query;
    console.log(rowsPerPage);
    const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
    let products = [];
    let allProducts = [];
    if (filter) {
      products = await Artist.find({ name: { $regex: filter, $options: "i" } })
        .skip(start)
        .limit(rowsPerPage);
      allProducts = await Artist.find({
        name: { $regex: filter, $options: "i" },
      });
    } else {
      products = await Artist.find({}).skip(start).limit(rowsPerPage);
      allProducts = await Artist.find({});
    }
    console.log("atists:", products.length);
    return res
      .status(200)
      .json({ products: products, all: allProducts.length, success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});

router.post("/", async (req, res) => {
  try {
    const newData = req.body;
    console.log("newData", newData);
    if (newData) {
      console.log(newData);
      const data = await Artist.find({ name: newData.name });
      if (data?.length) {
        return res
          .status(200)
          .json({ success: false, message: "This Music is already posted" });
      } else {
        const date = new Date();
        const newArtist = Artist({
          name: newData.name,
          profileImg: newData.profileImg,
          description: newData.description,
          star: newData.star,
        });
        if (newData.img === "") {
          newArtist.img = "";
        } else {
          const fileType = newData.profileImg.substring(
            newData.profileImg.indexOf("/") + 1,
            newData.profileImg.indexOf(";")
          );
          const fileName = `artist_${Date.now()}.${fileType}`;
          //   const store = await saveImage(newData.profileImg, filePath, fileName);
          //   console.log(store);
          //   if (store) {
          //     newArtist.profileImg = fileName;
          //   } else {
          //     return res
          //       .status(200)
          //       .json({ success: false, message: "Updating is failed" });
          //   }
          newArtist.profileImg = "asf";
        }
        newArtist
          .save()
          .then((result) => {
            console.log(result);
            return res.status(200).json({ data: result, success: true });
          })
          .catch((err) => {
            return res.status(200).json({ err, success: false });
          });
      }
    } else {
      console.log("There is some error!");
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, profileImg, description, star } = req.body;

    // Validate request body
    if (!name || !profileImg) {
      return res
        .status(400)
        .json({ message: "Name and profileImg are required." });
    }

    // Find and update the artist
    const updatedArtist = await Artist.findByIdAndUpdate(
      id,
      { name, profileImg, description, star },
      { new: true, runValidators: true }
    );

    if (!updatedArtist) {
      return res.status(404).json({ message: "Artist not found." });
    }

    res.status(200).json(updatedArtist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/", async (req, res) => {
  const productId = req.query.id;
  try {
    const result = await Artist.deleteOne({ _id: productId });
    if (result.deletedCount === 0) {
      return res.status(200).json({
        success: true,
        deleted: false,
        message: "No matching news found for deletion!",
      });
    } else {
      res.status(200).json({
        success: true,
        deleted: true,
        message: "Deleted Successfully!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});

router.get("/save", async (req, res) => {
  try {
    const products = [
      {
        name: "Salge Fuentes",
        profileImg: "artist-1",
        description:
          "Classical music is not confined to the past; it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners.",
      },
      {
        name: "Bowen Higgins",
        profileImg: "artist-2",
        description:
          "Classical music is not confined to the past; it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners.",
      },
      {
        name: "Leighton Kramer",
        profileImg: "artist-3",
        description:
          "Classical music is not confined to the past; it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners.",
      },
      {
        name: "Kylan Gentry",
        profileImg: "artist-4",
        description:
          "Classical music is not confined to the past; it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners.",
      },
    ];

    products.map((item) => {
      const newProduct = Artist(item);
      newProduct.save().then((result) => console.log(" saved:", result));
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

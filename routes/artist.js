const express = require("express");
const Artist = require("../models/artist.js");
const Product = require("../models/product.js");
const { publicUrl, filePath } = require("../consts/constant.js");
const { saveImage } = require("../consts/saveImage.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { rowsPerPage, curPage, filter } = req.query;
    console.log("rows:", rowsPerPage, curPage);
    const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
    let all = 0;
    let data = [];
    if (filter) {
      const artists = await Artist.find({
        name: { $regex: filter, $options: "i" },
      })
        .sort({ star: -1 })
        .skip(start)
        .limit(rowsPerPage);
      const allArtists = await Artist.find({
        name: { $regex: filter, $options: "i" },
      });
      all = allArtists.length;
      await Promise.all(
        artists.map(async (item) => {
          const product = await Product.find({ artist: item.name }).limit(8);
          data.push({
            artist: item,
            products: product,
          });
        })
      );
    } else {
      const artists = await Artist.find({})
        .sort({ star: -1 })
        .skip(start)
        .limit(rowsPerPage);
      const allArtists = await Artist.find();
      all = allArtists.length;
      await Promise.all(
        artists.map(async (item) => {
          const product = await Product.find({ artist: item.name }).limit(8);
          data.push({
            artist: item,
            products: product,
          });
        })
      );
    }
    return res.status(200).json({ data, all, success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
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

router.put("/", async (req, res) => {
  try {
    const newData = req.body;
    console.log(newData);
    if (newData) {
      const data = await Artist.findOne({ _id: newData.id });
      if (data) {
        data.name = newData.name;
        data.description = newData.description;
        data.star = newData.star;
        if (newData.profileImg !== `${publicUrl}${data.profileImg}`) {
          if (newData.profileImg === "") {
            data.profileImg = "";
          } else {
            const fileType = newData.profileImg.substring(
              newData.profileImg.indexOf("/") + 1,
              newData.profileImg.indexOf(";")
            );
            const fileName = `news_${newData.id}_${Date.now()}.${fileType}`;
            const store = await saveImage(
              newData.profileImg,
              filePath,
              fileName
            );
            console.log(store);
            if (store) {
              data.profileImg = fileName;
            } else {
              return res
                .status(200)
                .json({ success: false, message: "Updating is failed" });
            }
          }
        }
        data
          .save()
          .then((result) => {
            console.log(result);
            return res.status(200).json({ data: result, success: true });
          })
          .catch((err) => {
            return res.status(200).json({ err, success: false });
          });
      } else {
        return res
          .status(200)
          .json({ success: false, message: "Can't find the data" });
      }
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Send data correctly" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ err });
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

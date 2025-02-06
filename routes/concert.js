const router = require("express").Router();
const Concert = require("../models/concert");
require("dotenv").config();
const { saveImage } = require("../consts/saveImage");

router.get("/book", async (req, res) => {
  try {
    const { filter } = req.query;
    let concert = [];
    if (filter) {
      concert = await Concert.find({ name: { $regex: filter, $options: "i" } });
    } else {
      concert = await Concert.find({});
    }
    console.log(concert.length);
    return res.status(200).json({ concert: concert, success: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});


router.get("/", async (req, res) => {
  try {
    const {
      sortBy = "createdAt",
      order = "asc",
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
    } = req.query;

    // Convert pagination and sorting parameters to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Build query conditions
    const query = {};

    // Search across name, description, and location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Apply date range filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get all products based on query
    const allProducts = await Concert.find(query);

    // Separate isFeatured concerts
    const isFeatured = allProducts.filter((concert) => concert.isFeatured === true);

    // Paginate non-featured concerts
    const products = await Concert.find({ ...query, isFeatured: false })
      .sort({ [sortBy]: sortOrder }) // Apply sorting
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    // Get total count for pagination metadata
    const totalProducts = await Concert.countDocuments({ ...query, isFeatured: false });

    return res.status(200).json({
      isFeatured,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage: pageNumber,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});



router.post("/", async (req, res) => {
  try {
    const newData = req.body;
    console.log("Data:", newData);
    if (newData) {
      console.log(newData);
      const data = await Concert.find({ name: newData.name });
      if (data?.length) {
        return res
          .status(200)
          .json({ success: false, message: "This Music is already posted" });
      } else {
        const date = new Date();
        const newConcert = Concert(newData);
        // newConcert.img = fileName;
        // if (newData.img === "") {
        //   newConcert.img = "";
        // } else {
        //   const fileType = newData.img.substring(
        //     newData.img.indexOf("/") + 1,
        //     newData.img.indexOf(";")
        //   );
        //   const fileName = `news_${newData.id}_${Date.now()}.${fileType}`;
        //   const store = await saveImage(
        //     newData.img,
        //     process.env.FILE_PATH,
        //     fileName
        //   );
        //   console.log(store);
        //   if (store) {
        //     newConcert.img = fileName;
        //   } else {
        //     return res
        //       .status(200)
        //       .json({ success: false, message: "Updating is failed" });
        //   }
        // }
        newConcert
          .save()
          .then((result) => {
            console.log(result);
            return res.status(200).json({ data: result, success: true });
          })
          .catch((err) => {
            return res.status(200).json({ err, success: false });
          });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, img, description, location, link, isFeatured, timeframe } =
      req.body;
    const { id } = req.params; // Extract the concert ID from the URL parameter

    // Validate required fields
    if (!name || !timeframe?.start || !timeframe?.end) {
      return res
        .status(400)
        .json({ message: "Name, start date, and end date are required." });
    }

    // Find the concert by ID and update it
    const updatedConcert = await Concert.findByIdAndUpdate(
      id,
      { name, img, description, location, link, isFeatured, timeframe },
      { new: true } // This option ensures that the updated concert is returned
    );

    // Check if the concert exists
    if (!updatedConcert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    // Return the updated concert
    res.status(200).json(updatedConcert);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while updating the concert." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the concert ID from the URL parameter

    // Find the concert by ID
    const concert = await Concert.findById(id);

    // Check if the concert exists
    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    // Return the concert details
    res.status(200).json(concert);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the concert." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the concert ID from the URL parameter

    // Find and delete the concert by ID
    const deletedConcert = await Concert.findByIdAndDelete(id);

    // Check if the concert was found and deleted
    if (!deletedConcert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    // Return a success message or the deleted concert details
    res
      .status(200)
      .json({
        message: "Concert successfully deleted",
        concert: deletedConcert,
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the concert." });
  }
});

// router.put("/", async (req, res) => {
//   try {
//     const newData = req.body;
//     console.log(newData);
//     if (newData) {
//       const data = await Concert.findOne({ _id: newData.id });
//       if (data) {
//         data.name = newData.name;
//         data.category = newData.category;
//         data.timeframe = data.timeframe;
//         data.location = newData.location;
//         data.description = newData.description;
//         data.link = newData.link;
//         if (newData.img !== `${process.env.PUBLIC_URL}${data.img}`) {
//           if (newData.img === "") {
//             data.img = "";
//           } else {
//             const fileType = newData.img.substring(
//               newData.img.indexOf("/") + 1,
//               newData.img.indexOf(";")
//             );
//             const fileName = `news_${newData.id}_${Date.now()}.${fileType}`;
//             const store = await saveImage(
//               newData.img,
//               process.env.FILE_PATH,
//               fileName
//             );
//             console.log(store);
//             if (store) {
//               data.img = fileName;
//             } else {
//               return res
//                 .status(200)
//                 .json({ success: false, message: "Updating is failed" });
//             }
//           }
//         }
//         data
//           .save()
//           .then((result) => {
//             console.log(result);
//             return res.status(200).json({ data: result, success: true });
//           })
//           .catch((err) => {
//             return res.status(200).json({ err, success: false });
//           });
//       } else {
//         return res
//           .status(200)
//           .json({ success: false, message: "Can't find the data" });
//       }
//     } else {
//       return res
//         .status(200)
//         .json({ success: false, message: "Send data correctly" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ err });
//   }
// });

// router.delete("/", async (req, res) => {
//   const productId = req.query.id;
//   try {
//     const result = await Concert.deleteOne({ _id: productId });
//     if (result.deletedCount === 0) {
//       return res.status(200).json({
//         success: true,
//         deleted: false,
//         message: "No matching news found for deletion!",
//       });
//     } else {
//       res.status(200).json({
//         success: true,
//         deleted: true,
//         message: "Deleted Successfully!",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({ success: false, error: err });
//   }
// });

router.get("/save", async (req, res) => {
  try {
    const products = [
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-24T11:00:00.000+00:00",
          end: "2024-02-24T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-25T11:00:00.000+00:00",
          end: "2024-02-25T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-26T11:00:00.000+00:00",
          end: "2024-02-26T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-25T11:00:00.000+00:00",
          end: "2024-02-25T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-28T11:00:00.000+00:00",
          end: "2024-02-28T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-24T11:00:00.000+00:00",
          end: "2024-02-24T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-26T11:00:00.000+00:00",
          end: "2024-02-26T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-27T11:00:00.000+00:00",
          end: "2024-02-27T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-28T11:00:00.000+00:00",
          end: "2024-02-13T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-28T11:00:00.000+00:00",
          end: "2024-02-13T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
      {
        name: "Concert Name",
        category: "Wildlife",
        timeframe: {
          start: "2024-02-26T11:00:00.000+00:00",
          end: "2024-02-26T04:00:00.000+00:00",
        },
        description:
          "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
        location: "St. Sienburg, England",
      },
    ];

    products.map((item) => {
      const newProduct = Concert(item);
      newProduct.save().then((result) => console.log(" saved:", result));
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

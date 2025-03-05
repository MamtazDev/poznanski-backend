const express = require("express");
const {
  createNewsProposal,
  newsProposalRules,
  getNewsProposals,
} = require("../controllers/news.js");
const news = require("../models/news.js");

const router = express();

const newsProposalRoute = "/create/unknown";
router.post(newsProposalRoute, newsProposalRules, createNewsProposal);

const getNewsProposalsRoute = "/get/unknown";
router.get(getNewsProposalsRoute, getNewsProposals);

router.get("/all", async (req, res) => {
  try {
    const {
      sortBy = "createdAt",  // Default sort field
      order = "asc",          // Default order
      page = 1,               // Default page
      limit = 10,             // Default limit
      search,                 // Search query
      startDate,              // Date range filtering start
      endDate,                // Date range filtering end
      type,                   // Filter type (confirmed or proposed)
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (!type) {
      query.confirmed = true;  // Default filter is confirmed news
    } else if (type === "proposed") {
      query.confirmed = false;  // Filter for proposed (unconfirmed) news
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch total count for pagination metadata
    const totalNews = await news.countDocuments(query);

    // Paginate and sort the news articles
    const newsArticles = await news
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      news: newsArticles,
      totalNews,
      totalPages: Math.ceil(totalNews / pageSize),
      currentPage: pageNumber,
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});
router.get("/:email", async (req, res) => {
  try {
    const {
      sortBy = "createdAt",  // Default sort field
      order = "asc",          // Default order
      page = 1,               // Default page
      limit = 10,             // Default limit
      search,                 // Search query
      startDate,              // Date range filtering start
      endDate,                // Date range filtering end
      type,                   // Filter type (confirmed or proposed)
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    const email = req.params.email;  // Get email from route parameter
    const query = { email };  // Filter news by the given email

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (!type) {
      query.confirmed = true;  // Default filter is confirmed news
    } else if (type === "proposed") {
      query.confirmed = false;  // Filter for proposed (unconfirmed) news
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch total count for pagination metadata
    const totalNews = await news.countDocuments(query);

    // Paginate and sort the news articles based on email first, then by other criteria
    const newsArticles = await news
      .find(query)
      .sort({ email: 1, [sortBy]: sortOrder })  // Sort first by email, then by the selected field
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      news: newsArticles,
      totalNews,
      totalPages: Math.ceil(totalNews / pageSize),
      currentPage: pageNumber,
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, error: err });
  }
});




router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Use req.params to get the ID from the URL
    const newsItem = await news.findOne({ _id: id }); // Use findOne for a single document
    const relatedNews = await news
      .find({ _id: { $ne: id } }) // Exclude the current news item


    if (newsItem) {
      return res.status(200).json({
        news: newsItem,
        relatedNews,
        success: true,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Use req.params to get the ID from the URL
    const deletedNewsItem = await news.findByIdAndDelete(id); // Use findByIdAndDelete to remove a document by ID

    if (deletedNewsItem) {
      return res.status(200).json({
        success: true,
        message: "News item deleted successfully",
        deletedNews: deletedNewsItem, // Optionally return the deleted news item
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "News item not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// router.get('/', async (req, res) => {
//     try {
//         const { rowsPerPage, curPage, filter } = req.query;
//         const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
//         let products = [];
//         let allProducts = [];
//         if (filter) {
//             products = await News.find({ title: { $regex: filter, $options: 'i' } }).skip(start).limit(rowsPerPage);
//             allProducts = await News.find({ title: { $regex: filter, $options: 'i' } });
//         } else {
//             products = await News.find().skip(start).limit(rowsPerPage);
//             allProducts = await News.find();
//         }
//         console.log("news:", products.length);
//         return res.status(200).json({ news: products, all: allProducts.length, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.get('/top', async (req, res) => {
//     try {
//         const { filterText } = req.query;
//         let products = [];
//         if (filterText) {
//             products = await News.find({ title: { $regex: filterText, $options: 'i' } });
//         } else {
//             products = await News.find({});
//         }
//         console.log("news:", products.length);
//         return res.status(200).json({ news: products, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    console.log("data", data);

    if (!data.title || !data.content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required fields.",
      });
    }

    // Check if the news article already exists
    const existingNews = await news.findOne({ title: data.title });
    if (existingNews) {
      return res.status(200).json({
        success: false,
        message: "This news is already posted.",
      });
    }

    // Convert content array to a JSON string if it is an array
    const contentString = Array.isArray(data.content)
      ? JSON.stringify(data.content)
      : data.content;

    // Create a new article
    const newArticle = new news({
      title: data.title,
      intro: data.intro,
      content: contentString,
      files: data.files,
      nickname: data.nickname,
      email: data.email,
      tags: data.tags,
      date: data.date,
      confirmed: data.confirmed,
      confirmationToken: data.confirmationToken,
      commentsSection: data.commentsSection,
    });

    // Save the article to the database
    const savedArticle = await newArticle.save();
    return res.status(200).json({ success: true, data: savedArticle });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log("Updating news ID:", id, "with data:", data);

    // Find existing news article
    const existingArticle = await news.findById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "News article not found.",
      });
    }

    // Prepare the update object with only provided fields
    const updateData = { ...data };

    // Convert `content` array to a JSON string only if it exists
    if (data.content) {
      updateData.content = Array.isArray(data.content)
        ? JSON.stringify(data.content)
        : data.content;
    }

    // Use $set to update only provided fields
    const updatedArticle = await news.findByIdAndUpdate(id, { $set: updateData }, { 
      new: true, 
      runValidators: true 
    });

    return res.status(200).json({ success: true, data: updatedArticle });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


// router.put('/', async (req, res) => {
//     try {
//         const data = req.body;
//         if (!data) {
//             return res.status(400).json({ success: false, message: 'Send data correctly' });
//         }

//         // console.log(data);

//         // Convert the date to ISO format
//         const date = new Date(data.date);
//         const updatedDate = date.toISOString();

//         // Find the news data by ID
//         const newsData = await News.findOne({ _id: data.id });
//         if (!newsData) {
//             return res.status(404).json({ success: false, message: 'News data not found' });
//         }

//         // Update news data properties
//         newsData.title = data.title;
//         newsData.tag = data.feature;
//         newsData.date = updatedDate;
//         newsData.link = data.link;

//         // Process and update content images
//         const newContent = await Promise.all(data.content?.map(async (item, idx) => {
//             let updatedItem = item;
//             console.log(item.img, "dfsdfsdf", `${publicUrl}${newsData.content[idx]?.img}`)
//             if (newsData.content[idx] && item.img !== `${publicUrl}${newsData.content[idx]?.img}`) {
//                 if (item.img === "") {
//                     updatedItem.img = "";
//                 } else {
//                     const fileType = item.img.substring(item.img.indexOf('/') + 1, item.img.indexOf(';'));
//                     const fileName = `news_${Date.now()}_${idx}.${fileType}`;
//                     const store = await saveImage(item.img, filePath, fileName);
//                     if (store) {
//                         updatedItem.img = fileName;
//                     } else {
//                         throw new Error('Failed to save image');
//                     }
//                 }
//                 return updatedItem;
//             } else {
//                 updatedItem.img = item.img.replace(publicUrl, '');
//             }
//             return updatedItem;
//         }));

//         // Update news content with new image filenames
//         newsData.content = newContent;

//         // Save the updated news data to the database
//         const savedNewsData = await newsData.save();
//         console.log(savedNewsData);

//         return res.status(200).json({ data: savedNewsData, success: true });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'An error occurred while updating data' });
//     }
// });

// router.delete('/', async (req, res) => {
//     const newsId = req.query.id;
//     try {
//         const result = await News.deleteOne({ _id: newsId });
//         if (result.deletedCount === 0) {
//             return res.status(200).json({ success: true, deleted: false, message: "No matching news found for deletion!" });
//         } else {
//             res.status(200).json({ success: true, deleted: true, message: "Deleted Successfully!" })
//         }

//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// })

// router.get('/save', async (req, res) => {
//     try {
//         const products = [
//             {
//                 title: "GANDI GANDA - ZIELONY LIŚĆ PROD. GLONBEATZ",
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-0.jpg',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     },
//                     {
//                         subHead: 'Embracing Classical Music Today',
//                         img: 'news-0-2.jpg',
//                         description: "Classical music is not confined to the past; it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners. In conclusion, classical music is a treasure trove of beauty, emotion, and timeless melodies. Whether you're a seasoned aficionado or someone just beginning to explore this genre, classical music has something extraordinary to offer. So, take a moment to immerse yourself in the world of classical compositions, and let the harmonious symphonies of the past and present carry you away on a journey of musical discovery. In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 tag: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "WYWIAD: SAFON X POZNANSKIRAP.COM / REINKARNACJA",
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-1.png',
//                         description: "Classical music is not confined to the past, it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners.In conclusion, classical music is a treasure trove of beauty, emotion, and timeless melodies. Whether you're a seasoned aficionado or someone just beginning to explore this genre, classical music has something extraordinary to offer. So, take a moment to immerse yourself in the world of classical compositions, and let the harmonious symphonies of the past and present carry you away on a journey of musical discovery. In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 tag: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "WYWIAD: SAFON X POZNANSKIRAP.COM / REINKARNACJA",
//                 tag: 'Wildlife',
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-1.png',
//                         description: "Classical music is not confined to the past, it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners.In conclusion, classical music is a treasure trove of beauty, emotion, and timeless melodies. Whether you're a seasoned aficionado or someone just beginning to explore this genre, classical music has something extraordinary to offer. So, take a moment to immerse yourself in the world of classical compositions, and let the harmonious symphonies of the past and present carry you away on a journey of musical discovery. In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "DJ SOINA FEAT. SŁOŃ - VIDEO MIXTAPE",
//                 tag: 'Wildlife',
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-2.png',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "DJ SOINA FEAT. SŁOŃ - VIDEO MIXTAPE",
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-2.png',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 tag: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "NOWY NUMER 0.Y.S I SENI JUŻ W STYCZNIU",
//                 tag: 'Wildlife',
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-3.png',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "NOWY NUMER 0.Y.S I SENI JUŻ W STYCZNIU",
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-3.png',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 tag: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "DJ SOINA FEAT. SŁOŃ - VIDEO MIXTAPE",
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-2.png',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 tag: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "NOWY NUMER 0.Y.S I SENI JUŻ W STYCZNIU",
//                 tag: 'Wildlife',
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-3.png',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "WYWIAD: SAFON X POZNANSKIRAP.COM / REINKARNACJA",
//                 tag: 'Wildlife',
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-1.png',
//                         description: "Classical music is not confined to the past, it continues to evolve and find new expressions in the modern world. Composers are infusing classical elements into their works, creating a fusion of old and new that appeals to a diverse range of listeners.In conclusion, classical music is a treasure trove of beauty, emotion, and timeless melodies. Whether you're a seasoned aficionado or someone just beginning to explore this genre, classical music has something extraordinary to offer. So, take a moment to immerse yourself in the world of classical compositions, and let the harmonious symphonies of the past and present carry you away on a journey of musical discovery. In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//             {
//                 title: "DJ SOINA FEAT. SŁOŃ - VIDEO MIXTAPE",
//                 tag: 'Wildlife',
//                 content: [
//                     {
//                         subHead: 'Rediscovering Classical Music',
//                         img: 'news-2.png',
//                         description: "In an era dominated by electronic beats and catchy pop tunes, many music enthusiasts are rediscovering the enchantment of classical compositions. What makes classical music so enduringly appealing? Let's delve into the world of sonatas, concertos, and symphonies to uncover the magic. Classical music is defined by its rich, intricate melodies that have the ability to convey profound emotions without the need for lyrics. The soaring notes of a violin concerto or the gentle strains of a piano sonata can transport listeners to another realm, evoking feelings of joy, sorrow, and everything in between."
//                     }
//                 ],
//                 date: '2024-02-13T05:00:00.000+00:00',
//             },
//         ];

//         products.map((item) => {
//             const newProduct = News(item);
//             newProduct.save()
//                 .then((result) => console.log(" saved:", result));
//         })
//     } catch (err) {
//         console.log(err);
//     }
// })

module.exports = router;

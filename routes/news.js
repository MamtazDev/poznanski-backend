const express = require('express');
const { saveImage } = require('../consts/saveImage.js');
const { createNewsProposal, newsProposalRules, getNewsProposals } = require('../controllers/news.js');

const router = express();

// create proposal from unknown user:
const newsProposalRoute = '/create/unknown';
router.post(newsProposalRoute, newsProposalRules, createNewsProposal);

// get all proposals from unknown:
const getNewsProposalsRoute = '/get/unknown';
router.get(getNewsProposalsRoute, getNewsProposals);

// router.get('/all', async (req, res) => {
//     try {
//         const products = await News.find();
//         console.log("news:", products.length);
//         return res.status(200).json({ news: products, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.get('/id', async (req, res) => {
//     try {
//         const { id } = req.query;
//         const news = await News.find({ _id: id });
//         const relatedNews = await News.find({ _id: { $ne: id } }).sort({ date: -1 }).limit(5);
//         if (news && relatedNews) {
//             return res.status(200).json({ news, relatedNews, success: true });
//         } else {
//             return res.status(200).json({ success: false });
//         }
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// })

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

// router.post('/', async (req, res) => {
//     try {
//         const data = req.body;
//         if (data) {
//             console.log(data);
//             const result = await News.find({ title: data.title });
//             if (result?.length) {
//                 return res.status(200).json({ success: false, message: 'This news is already posted' });
//             } else {
//                 const newContent = await Promise.all(data.content?.map(async (item, idx) => {
//                     let updatedItem = item;
//                     if (item.img === "") {
//                         updatedItem.img = "";
//                     } else {
//                         const fileType = item.img.substring(item.img.indexOf('/') + 1, item.img.indexOf(';'));
//                         const fileName = `news_${Date.now()}_${idx}.${fileType}`;
//                         const store = await saveImage(item.img, filePath, fileName);
//                         if (store) {
//                             updatedItem.img = fileName;
//                         } else {
//                             throw new Error('Failed to save image');
//                         }
//                     }
//                     return updatedItem;
//                 }));
//                 const newArticle = News({
//                     title: data.title,
//                     tag: data.feature,
//                     date: data.date,
//                     content: newContent,
//                     link: data.link
//                 });
//                 newArticle.save()
//                     .then((result) => {
//                         console.log(result);
//                         return res.status(200).json({ data: result, success: true });
//                     })
//                     .catch((err) => {
//                         return res.status(200).json({ err, success: false });
//                     })
//             }
//         }

//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

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
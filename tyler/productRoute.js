// const express = require('express');
// const Product = require('../models/product.js');
// const { filePath, publicUrl } = require('dotenv');
// const { saveImage } = require('../consts/saveImage.js');

// const router = express.Router();

// router.get('/material', async (req, res) => {
//     try {
//         const { filter } = req.query;
//         let products = [];
//         if (filter) {
//             products = await Product.find({ title: { $regex: filter, $options: 'i' } });
//         } else {
//             products = await Product.find({});
//         }
//         console.log("material:", products.length);
//         return res.status(200).json({ material: products, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.get('/tv', async (req, res) => {
//     try {
//         const { rowsPerPage, curPage, filter } = req.query;
//         const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
//         let products = [];
//         let allProducts = [];
//         if (filter) {
//             products = await Product.find({ star: 5, title: { $regex: filter, $options: 'i' } }).skip(start).limit(rowsPerPage);
//             allProducts = await Product.find({ star: 5, title: { $regex: filter, $options: 'i' } });
//         } else {
//             products = await Product.find({ star: 5, }).skip(start).limit(rowsPerPage);
//             allProducts = await Product.find({ star: 5, });
//         }
//         console.log("Admin products:", products.length);
//         return res.status(200).json({ products: products, all: allProducts.length, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.get('/', async (req, res) => {
//     try {
//         const { rowsPerPage, curPage, filter } = req.query;
//         const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
//         let products = [];
//         let allProducts = [];
//         if (filter) {
//             products = await Product.find({ title: { $regex: filter, $options: 'i' } }).skip(start).limit(rowsPerPage);
//             allProducts = await Product.find({ title: { $regex: filter, $options: 'i' } });
//         } else {
//             products = await Product.find({}).skip(start).limit(rowsPerPage);
//             allProducts = await Product.find({});
//         }
//         console.log("Admin products:", products.length);
//         return res.status(200).json({ products: products, all: allProducts.length, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.post('/', async (req, res) => {
//     try {
//         const newData = req.body;
//         if (newData) {
//             console.log(newData);
//             const data = await Product.find({ title: newData.title });
//             if (data?.length) {
//                 return res.status(200).json({ success: false, message: 'This Music is already posted' });
//             } else {
//                 const date = new Date();
//                 const newProduct = Product({
//                     title: newData.title,
//                     category: newData.category,
//                     link: newData.link,
//                     location: newData.location,
//                     artist: newData.artist,
//                     date: date,
//                     star: newData.star
//                 });
//                 if (newData.img === "") {
//                     newProduct.img = "";
//                 } else {
//                     const fileType = newData.img.substring(newData.img.indexOf('/') + 1, newData.img.indexOf(';'));
//                     const fileName = `news_${newData.id}_${Date.now()}.${fileType}`;
//                     const store = await saveImage(newData.img, filePath, fileName);
//                     console.log(store);
//                     if (store) {
//                         newProduct.img = fileName;
//                     } else {
//                         return res.status(200).json({ success: false, message: 'Updating is failed' })
//                     }
//                 }
//                 newProduct.save()
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
//         const newData = req.body;
//         console.log(newData);
//         if (newData) {
//             const data = await Product.findOne({ _id: newData.id });
//             if (data) {
//                 const date = new Date();
//                 data.title = newData.title;
//                 data.category = newData.category;
//                 data.date = date;
//                 data.location = newData.location;
//                 data.artist = newData.artist;
//                 data.star = newData.star;
//                 data.link = newData.link;
//                 if (newData.img !== `${publicUrl}${data.img}`) {
//                     if (newData.img === "") {
//                         data.img = "";
//                     } else {
//                         const fileType = newData.img.substring(newData.img.indexOf('/') + 1, newData.img.indexOf(';'));
//                         const fileName = `news_${newData.id}_${Date.now()}.${fileType}`;
//                         const store = await saveImage(newData.img, filePath, fileName);
//                         console.log(store);
//                         if (store) {
//                             data.img = fileName;
//                         } else {
//                             return res.status(200).json({ success: false, message: 'Updating is failed' })
//                         }
//                     }
//                 }
//                 data.save()
//                     .then((result) => {
//                         console.log(result);
//                         return res.status(200).json({ data: result, success: true });
//                     })
//                     .catch((err) => {
//                         return res.status(200).json({ err, success: false });
//                     })
//             } else {
//                 return res.status(200).json({ success: false, message: "Can't find the data" });
//             }
//         } else {
//             return res.status(200).json({ success: false, message: 'Send data correctly' })
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(400).json({ err });
//     }
// });

// router.get('/radio', async (req, res) => {
//     try {
//         const { filter } = req.query;
//         let products = [];
//         if (filter) {
//             products = await Product.find({ star: 5, title: { $regex: filter, $options: 'i' } });
//         } else {
//             products = await Product.find({ star: 5 });
//         }
//         console.log("Radio:", products.length);
//         return res.status(200).json({ radio: products, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.get('/top-rated', async (req, res) => {
//     try {
//         const { rowsPerPage, curPage, filter } = req.query;
//         const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
//         let products = [];
//         let allProducts = [];
//         if (filter) {
//             products = await Product.find({ title: { $regex: filter, $options: 'i' }, star: 5 }).skip(start).limit(rowsPerPage);
//             allProducts = await Product.find({ title: { $regex: filter, $options: 'i' }, star: 5 });
//         } else {
//             products = await Product.find({ star: 5 }).skip(start).limit(rowsPerPage);
//             allProducts = await Product.find({ star: 5 });
//         }
//         console.log("products:", products.length);
//         return res.status(200).json({ products: products, all: allProducts.length, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.get('/new', async (req, res) => {
//     try {
//         const { filter } = req.query;
//         let newProducts = [];
//         if (filter) {
//             newProducts = await Product.find({ title: { $regex: filter, $options: 'i' } }).sort({ date: -1 }).limit(18);
//         } else {
//             newProducts = await Product.find({}).sort({ date: -1 }).limit(18);
//         }
//         console.log("newRelease:", newProducts.length);
//         return res.status(200).json({ success: true, newProducts });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false });
//     }
// });

// router.delete('/', async (req, res) => {
//     const productId = req.query.id;
//     try {
//         const result = await Product.deleteOne({ _id: productId });
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
//                 title: "PEJA/SLUMS ATTACK",
//                 img: 'product-10',
//                 category: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//                 location: 'New York',
//                 artist: "Kylan Gentry",
//             },
//             {
//                 title: "ŚLIWA - NA SWOIM EP",
//                 img: 'product-11',
//                 category: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//                 location: 'New York',
//                 artist: "Bowen Higgins",
//             },
//             {
//                 title: `DONGURALESKO`,
//                 img: 'product-12',
//                 category: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//                 location: 'New York',
//                 artist: "Bowen Higgins",
//             },
//             {
//                 title: "HANS X FOLKU - 8122",
//                 img: 'product-13',
//                 category: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//                 location: 'New York',
//                 artist: "Bowen Higgins",
//             },
//             {
//                 title: "ŚLIWA - NA SWOIM EP",
//                 img: 'product-11',
//                 category: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//                 location: 'New York',
//                 artist: "Bowen Higgins",
//             },
//             {
//                 title: `DONGURALESKO`,
//                 img: 'product-12',
//                 category: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//                 location: 'New York',
//                 artist: "Bowen Higgins",
//             },
//             {
//                 title: "HANS X FOLKU - 8122",
//                 img: 'product-13',
//                 category: 'Wildlife',
//                 date: '2024-02-13T05:00:00.000+00:00',
//                 location: 'New York',
//                 artist: "Bowen Higgins",
//             },
//         ];

//         products.map((item) => {
//             const newProduct = Product(item);
//             newProduct.save()
//                 .then((result) => console.log(" saved:", result));
//         })
//     } catch (err) {
//         console.log(err);
//     }
// })

// module.exports = router;
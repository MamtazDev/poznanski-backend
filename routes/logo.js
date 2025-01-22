const express = require('express');
const Logo = require('../models/logo.js');
require('dotenv').config();
const { saveImage } = require('../consts/saveImage.js');

const router = express();

router.get('/', async (req, res) => {
    try {
        const logos = await Logo.find();
        console.log("partner logos:", logos.length);
        return res.status(200).json({ logos, success: true });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
})

router.get('/admin', async (req, res) => {
    try {
        const { rowsPerPage, curPage, filter } = req.query;
        const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
        let products = [];
        let allProducts = [];
        if (filter) {
            products = await Logo.find({ name: { $regex: filter, $options: 'i' } }).skip(start).limit(rowsPerPage);
            allProducts = await Logo.find({ title: { $regex: filter, $options: 'i' } });
        } else {
            products = await Logo.find({}).skip(start).limit(rowsPerPage);
            allProducts = await Logo.find({});
        }
        console.log("logos:", products.length);
        return res.status(200).json({ logos: products, all: allProducts.length, success: true });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
});

router.post('/', async (req, res) => {
    try {
        const newData = req.body;
        if (newData) {
            console.log(newData);
            const data = await Logo.find({ name: newData.name });
            if (data?.length) {
                return res.status(200).json({ success: false, message: 'This Logo is already posted' });
            } else {
                const date = new Date();
                const newLogo = Logo({
                    name: newData.name,
                    img1: newData.img1,
                    img2: newData.img2,
                    description: newData.description,
                });
                if (newData.img1 !== `${process.env.publicUrl}${data.img1}`) {
                    if (newData.img1 === "") {
                        return res.status(200).json({ success: false, message: "Please Upload the light mode logo image." });
                    } else {
                        const fileType = newData.img1.substring(newData.img1.indexOf('/') + 1, newData.img1.indexOf(';'));
                        const fileName = `logo_${newData.id}_${Date.now()}.${fileType}`;
                        const store = await saveImage(newData.img1, process.env.filePath, fileName);
                        console.log(store);
                        if (store) {
                            newLogo.img1 = fileName;
                        } else {
                            return res.status(200).json({ success: false, message: 'Updating is failed' })
                        }
                    }
                }
                if (newData.img2 !== `${process.env.publicUrl}${data.img2}`) {
                    if (newData.img2 === "") {
                        return res.status(200).json({ success: false, message: "Please Upload the darl mode logo image." });
                    } else {
                        const fileType = newData.img2.substring(newData.img2.indexOf('/') + 1, newData.img2.indexOf(';'));
                        const fileName = `logo_${newData.id}_${Date.now()}_2.${fileType}`;
                        const store = await saveImage(newData.img2, process.env.filePath, fileName);
                        console.log(store);
                        if (store) {
                            newLogo.img2 = fileName;
                        } else {
                            return res.status(200).json({ success: false, message: 'Updating is failed' })
                        }
                    }
                }
                newLogo.save()
                    .then((result) => {
                        console.log(result);
                        return res.status(200).json({ data: result, success: true });
                    })
                    .catch((err) => {
                        return res.status(200).json({ err, success: false });
                    })
            }
        }

    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
});

router.put('/', async (req, res) => {
    try {
        const newData = req.body;
        console.log(newData);
        if (newData) {
            const data = await Logo.findOne({ _id: newData.id });
            if (data) {
                data.name = newData.name;
                data.timeframe = data.timeframe;
                data.description = newData.description;
                if (newData.img1 !== `${process.env.publicUrl}${data.img1}`) {
                    if (newData.img1 === "") {
                        return res.status(200).json({ success: false, message: "Please Upload the Logo image." });
                    } else {
                        const fileType = newData.img1.substring(newData.img1.indexOf('/') + 1, newData.img1.indexOf(';'));
                        const fileName = `logo_${newData.id}_${Date.now()}.${fileType}`;
                        const store = await saveImage(newData.img1, process.env.filePath, fileName);
                        console.log(store);
                        if (store) {
                            data.img1 = fileName;
                        } else {
                            return res.status(200).json({ success: false, message: 'Updating is failed' })
                        }
                    }
                }
                if (newData.img2 !== `${process.env.publicUrl}${data.img2}`) {
                    if (newData.img2 === "") {
                        return res.status(200).json({ success: false, message: "Please Upload the 2-Logo image." });
                    } else {
                        const fileType = newData.img2.substring(newData.img2.indexOf('/') + 1, newData.img2.indexOf(';'));
                        const fileName = `logo_${newData.id}_${Date.now()}.${fileType}_2`;
                        const store = await saveImage(newData.img2, process.env.filePath, fileName);
                        console.log(store);
                        if (store) {
                            data.img2 = fileName;
                        } else {
                            return res.status(200).json({ success: false, message: 'Updating is failed' })
                        }
                    }
                }
                data.save()
                    .then((result) => {
                        console.log(result);
                        return res.status(200).json({ data: result, success: true });
                    })
                    .catch((err) => {
                        return res.status(200).json({ err, success: false });
                    })
            } else {
                return res.status(200).json({ success: false, message: "Can't find the data" });
            }
        } else {
            return res.status(200).json({ success: false, message: 'Send data correctly' })
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ err });
    }
});

router.delete('/', async (req, res) => {
    const productId = req.query.id;
    try {
        const result = await Logo.deleteOne({ _id: productId });
        if (result.deletedCount === 0) {
            return res.status(200).json({ success: true, deleted: false, message: "No matching news found for deletion!" });
        } else {
            res.status(200).json({ success: true, deleted: true, message: "Deleted Successfully!" })
        }

    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
});

router.get('/save', async (req, res) => {
    try {
        const products = [
            {
                name: "logo Name",
                img1: 'partner-logo-3.png',
                img2: 'partner-logo-3-2.png',
            },
            {
                name: "logo Name",
                img1: 'partner-logo-4.png',
                img2: 'partner-logo-4-2.png',
            },
            {
                name: "logo Name",
                img1: 'partner-logo-5.png',
                img2: 'partner-logo-5-2.png',
            },
            {
                name: "logo Name",
                img1: 'partner-logo-6.png',
                img2: 'partner-logo-6-2.png',
            },
        ];

        products.map((item) => {
            const newProduct = Logo(item);
            newProduct.save()
                .then((result) => console.log(" saved:", result));
        })
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;
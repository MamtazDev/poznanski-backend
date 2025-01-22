const router = require('express').Router();
const Concert = require('../models/concert');
require('dotenv').config();
const { saveImage } = require('../consts/saveImage');

router.get('/book', async (req, res) => {
    try {
        const { filter } = req.query;
        let concert = [];
        if (filter) {
            concert = await Concert.find({ name: { $regex: filter, $options: 'i' } });
        } else {
            concert = await Concert.find({});
        }
        console.log(concert.length);
        return res.status(200).json({ concert: concert, success: true });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
})

router.get('/', async (req, res) => {
    try {
        const { rowsPerPage, curPage, filter } = req.query;
        const start = parseInt(rowsPerPage, 10) * (parseInt(curPage, 10) - 1);
        let products = [];
        let allProducts = [];
        if (filter) {
            products = await Concert.find({ name: { $regex: filter, $options: 'i' } }).skip(start).limit(rowsPerPage);
            allProducts = await Concert.find({ name: { $regex: filter, $options: 'i' } });
        } else {
            products = await Concert.find({}).skip(start).limit(rowsPerPage);
            allProducts = await Concert.find({});
        }
        console.log("concerts:", products.length);
        return res.status(200).json({ products: products, all: allProducts.length, success: true });
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
            const data = await Concert.find({ name: newData.name });
            if (data?.length) {
                return res.status(200).json({ success: false, message: 'This Music is already posted' });
            } else {
                const date = new Date();
                const newConcert = Concert({
                    name: newData.name,
                    category: newData.category,
                    link: newData.link,
                    location: newData.location,
                    description: newData.description,
                    timeframe: {
                        start: date,
                        end: date,
                    },
                });
                if (newData.img === "") {
                    newConcert.img = "";
                } else {
                    const fileType = newData.img.substring(newData.img.indexOf('/') + 1, newData.img.indexOf(';'));
                    const fileName = `news_${newData.id}_${Date.now()}.${fileType}`;
                    const store = await saveImage(newData.img, process.env.FILE_PATH, fileName);
                    console.log(store);
                    if (store) {
                        newConcert.img = fileName;
                    } else {
                        return res.status(200).json({ success: false, message: 'Updating is failed' })
                    }
                }
                newConcert.save()
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
            const data = await Concert.findOne({ _id: newData.id });
            if (data) {
                data.name = newData.name;
                data.category = newData.category;
                data.timeframe = data.timeframe;
                data.location = newData.location;
                data.description = newData.description;
                data.link = newData.link;
                if (newData.img !== `${process.env.PUBLIC_URL}${data.img}`) {
                    if (newData.img === "") {
                        data.img = "";
                    } else {
                        const fileType = newData.img.substring(newData.img.indexOf('/') + 1, newData.img.indexOf(';'));
                        const fileName = `news_${newData.id}_${Date.now()}.${fileType}`;
                        const store = await saveImage(newData.img, process.env.FILE_PATH, fileName);
                        console.log(store);
                        if (store) {
                            data.img = fileName;
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
        const result = await Concert.deleteOne({ _id: productId });
        if (result.deletedCount === 0) {
            return res.status(200).json({ success: true, deleted: false, message: "No matching news found for deletion!" });
        } else {
            res.status(200).json({ success: true, deleted: true, message: "Deleted Successfully!" })
        }

    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
})

router.get('/save', async (req, res) => {
    try {
        const products = [
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-24T11:00:00.000+00:00',
                    end: '2024-02-24T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-25T11:00:00.000+00:00',
                    end: '2024-02-25T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-26T11:00:00.000+00:00',
                    end: '2024-02-26T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-25T11:00:00.000+00:00',
                    end: '2024-02-25T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-28T11:00:00.000+00:00',
                    end: '2024-02-28T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-24T11:00:00.000+00:00',
                    end: '2024-02-24T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-26T11:00:00.000+00:00',
                    end: '2024-02-26T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-27T11:00:00.000+00:00',
                    end: '2024-02-27T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-28T11:00:00.000+00:00',
                    end: '2024-02-13T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-28T11:00:00.000+00:00',
                    end: '2024-02-13T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
            {
                name: "Concert Name",
                category: 'Wildlife',
                timeframe: {
                    start: '2024-02-26T11:00:00.000+00:00',
                    end: '2024-02-26T04:00:00.000+00:00'
                },
                description: "Fusce justo mi, vehicula id arcu et, dapibus tristique lectus. Vivamus a elit sodales, tincidunt nunc non, maximus lacus. Fusce a augue sed dolor auctor iaculis vitae id mauris. Integer ut lectus non neque suscipit luctus. Mauris et erat id ipsum condimentum cursus. Sed tempus enim non massa mattis iaculis. In quis massa risus",
                location: "St. Sienburg, England",
            },
        ];

        products.map((item) => {
            const newProduct = Concert(item);
            newProduct.save()
                .then((result) => console.log(" saved:", result));
        })
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;
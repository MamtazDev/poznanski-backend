const express = require('express');
const Tag = require('../models/tag.js');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const tags = await Tag.find();
        return res.status(200).json({ tags, success: true });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err });
    }
})

router.post('/', async (req, res) => {
    try {
        const name = req.body.name;
        const tag = await Tag.find({ name });
        console.log(tag);
        if (tag?.length) {
            console.log("This tag is already exist.");
            return res.status(200).json({ message: "This tag is already exist.", success: false });
        } else {
            const newTag = Tag({
                name
            });
            newTag.save()
                .then((result) => {
                    console.log("newTag:", result);
                    return res.status(200).json({ result, success: true })
                })
                .catch((error) => {
                    return res.status(200).json({ error, success: false })
                })
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ err });
    }
})

router.get('/save', async (req, res) => {
    try {
        const products = [
            {
                name: "Whildlife",
            },
            {
                name: "Live",
            },
        ];

        products.map((item) => {
            const newProduct = Tag(item);
            newProduct.save()
                .then((result) => console.log(" saved:", result));
        })
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;
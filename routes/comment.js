const express = require("express");
const { verifyAuth } = require("../controllers/auth.js");
const {
  addCommentOrReply,
  getCommentsAndReplies,
  getPaginatedComments,
} = require("../controllers/comments.js");

const router = express();

router.post("/:postModel/:postId", verifyAuth, addCommentOrReply);
router.get("/:postModel/:postId", getCommentsAndReplies);
router.get("/:postModel/:postId/:page", getPaginatedComments);
// router.get('/data', async (req, res) => {
//     try {
//         const { entityId } = req.query;
//         console.log("entityId:", entityId);
//         const comments = await Comments.find({ entityId }).limit(3);
//         // if (filter) {
//         //     products = await Artist.find({ name: { $regex: filter, $options: 'i' } }).skip(start).limit(rowsPerPage);
//         //     allProducts = await Artist.find({ name: { $regex: filter, $options: 'i' } });
//         // } else {
//         //     products = await Artist.find({}).skip(start).limit(rowsPerPage);
//         //     allProducts = await Artist.find({});
//         // }
//         console.log("comments:", comments.length);
//         return res.status(200).json({ comments, success: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ success: false, error: err });
//     }
// });

// router.delete('/', async (req, res) => {
//     const commentId = req.query.id;
//     try {
//         const result = await Comments.deleteOne({ _id: commentId });
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
//                 entityId: "65e7125134122410358af3ae",
//                 name: "Salge Fuentes",
//                 email: "Salge Fuentes@gmail.com",
//                 comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam nisi, cras neque, lorem vel vulputate vitae aliquam. Pretium tristique nisi, ut commodo fames. Porttitor et sagittis egestas vitae metus, odio tristique amet, duis. Nunc elit aliquet quis in mauris. consectetur adipiscing elit. Diam nisi, cras neque"
//             },
//         ];

//         products.map((item) => {
//             const newProduct = Comments(item);
//             newProduct.save()
//                 .then((result) => console.log(" saved:", result));
//         })
//     } catch (err) {
//         console.log(err);
//     }
// })

module.exports = router;

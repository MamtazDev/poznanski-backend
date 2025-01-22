const News = require('../models/news');
const {Comment} = require('../models/comment');

// Middleware to determine the post model
const getModelByName = (modelName) => {
	const models = {
		News,
		Comment,
	};
	return models[modelName];
};

const addCommentOrReply = async (req, res) => {
	console.log(req);
	const {postModel, postId} = req.params;
	const {content, parentCommentId} = req.body;

	try {
		const PostModel = getModelByName(postModel);
		if (!PostModel)
			return res.status(400).json({error: 'Invalid post model'});

		const post = await PostModel.findById(postId);
		if (!post) return res.status(404).json({error: 'Post not found'});

		const newCommentData = {
			entityId: postId,
			entityModel: postModel,
			authorId: req.user.id,
			content,
		};

		const newComment = new Comment(newCommentData);

		if (parentCommentId) {
			// Add as a reply to another comment
			console.log('parentCommentId', parentCommentId, '');
			const parentComment = await Comment.findOne({
				entityModel: postModel,
				_id: parentCommentId,
			});
			const newReply = new Comment({...newCommentData, parentCommentId});
			if (!parentComment)
				return res
					.status(404)
					.json({error: 'Parent comment not found'});

			await newReply.save();

			parentComment.repliesIds.push(newReply._id);
			// await parentComment.save();
			const newestThreeComments = await Comment.find({
				parentCommentId,
			})
				.sort({createdAt: -1})
				.limit(3);

			console.log('newestThreeComments', newestThreeComments, '');
			parentComment.embeddedReplies = newestThreeComments;
			// if (parentComment.embeddedReplies.length < 3) {
			// 	parentComment.embeddedReplies.push(newComment);
			// } else {
			// 	parentComment.repliesIds.push(newComment._id);
			// }
			await parentComment.save();
		} else {
			// Ensure the commentsSection exists
			if (!post.commentsSection) {
				post.commentsSection = {
					embeddedComments: [],
					commentsIds: [],
				};
			}
			// Embed the newest 3 comments, then add as references
			await newComment.save();
			post.commentsSection.commentsIds.push(newComment._id);

			const commentsIds = post.commentsSection.commentsIds;
			const newestThreeComments = await Comment.find({
				entityModel: postModel,
				entityId: {$in: postId},
			})
				.sort({createdAt: -1})
				.limit(3);

			post.commentsSection.embeddedComments = newestThreeComments;

			await post.save();
		}

		res.status(201).json(newComment);
	} catch (error) {
		res.status(500).json({error: error.message});
	}
};

const getCommentsAndReplies = async (req, res) => {
	const {postModel, postId} = req.params;

	try {
		const PostModel = getModelByName(postModel);
		if (!PostModel) {
			return res.status(400).json({error: 'Invalid post model'});
		}

		const post = await PostModel.findOne({
			_id: postId,
		})
			//   .populate({
			//     path: 'commentsSection.commentsIds',
			//     model: 'Comment',
			//     populate: {
			//       path: 'repliesIds',
			//       model: 'Comment',
			//       populate: {
			//         path: 'authorId',
			//         model: 'User',
			//         select: 'nickname avatar id',
			//       },
			//     },
			//   })
			.populate({
				path: 'commentsSection.embeddedComments.authorId',
				model: 'User',
				select: 'nickname profilePicture id',
			});

		if (!post) {
			return res.status(404).json({error: 'Post not found'});
		}

		const comments = {
			embeddedComments: post.commentsSection.embeddedComments,
			commentsIds: post.commentsSection.commentsIds,
		};

		res.status(200).json(comments);
	} catch (error) {
		res.status(500).json({error: error.message});
	}
};

const updateCommentOrReply = async (req, res) => {
	const {postModel, postId, commentId} = req.params;
	const {content} = req.body;

	try {
		// Update the comment with the given commentId, entityModel, and entityId
		const comment = await Comment.findOneAndUpdate(
			{_id: commentId, entityModel: postModel, entityId: postId},
			{content},
			{new: true}
		);

		if (!comment) return res.status(404).json({error: 'Comment not found'});

		res.status(200).json(comment);
	} catch (error) {
		res.status(500).json({error: error.message});
	}
};

const deleteCommentOrReply = async (req, res) => {
	const {postModel, postId, commentId} = req.params;
	try {
		const comment = await Comment.findOneAndDelete({
			_id: commentId,
			entityModel: postModel,
			entityId: postId,
		});
		if (!comment) return res.status(404).json({error: 'Comment not found'});

		if (comment.entityId.toString() === postId) {
			// It's a top-level comment
			await Post.updateOne(
				{_id: postId},
				{
					$pull: {
						'commentsSection.commentsIds': commentId,
						'commentsSection.embeddedComments': {_id: commentId},
					},
				}
			);
		} else {
			// It's a reply
			await Comment.updateOne(
				{_id: comment.entityId},
				{
					$pull: {
						repliesIds: commentId,
						embeddedReplies: {_id: commentId},
					},
				}
			);
		}

		await Comment.findByIdAndDelete(commentId);
		res.status(200).json({message: 'Comment deleted'});
	} catch (error) {
		res.status(500).json({error: error.message});
	}
};

// Get paginated comments for a post
const getPaginatedComments = async (req, res) => {
	const {postModel, postId, page} = req.params;
	console.log(req.body)
	const {limit = 10, parentCommentId} = req.query; // Default to page 1, limit 10
console.log('Twoja stara', req.query)

	try {
		const PostModel = getModelByName(postModel);
		if (!PostModel)
			return res.status(400).json({error: 'Invalid post model'});
		console.log(parentCommentId)
		if(parentCommentId){
			const comments = await Comment.findOne({
				entityModel: postModel,
				entityId: postId,
				_id: parentCommentId,
			})
			.populate({
					path: 'repliesIds',
					model: 'Comment',
					populate: {
						path: 'authorId',
						model: 'User',
						select: 'nickname avatar id',
					},
				})



				// .populate({
				// 	path: 'authorId',
				// 	model: 'User',
				// 	select: 'nickname avatar id',
				// })
				// .populate({
				// 	path: 'repliesIds',
				// 	model: 'Comment',
				// 	populate: {
				// 		path: 'authorId',
				// 		model: 'User',
				// 		select: 'nickname avatar id',
				// 	},
				// })


				let shouldReverse = false;

				const processedComments = comments.repliesIds.flatMap(({_doc}, idx) => {
					// const prevHasDifferentAuthor =
					// 	idx > 0 &&
					// 	comments.repliesIds[idx - 1]?.authorId._id !== _doc.authorId._id;

					// if (prevHasDifferentAuthor) {
					// 	shouldReverse = !shouldReverse;
					// }

					return {
						..._doc,
						// shouldReverse,
					};
				});
				// const totalComments = await Comment.countDocuments({
				//  	parentCommentId: {$in: parentCommentId},
				// });
				console.log('comments', processedComments)
				res.status(200).json({
					comments: processedComments,
					totalComments: comments.repliesIds.length ?? 0,
					totalPages: Math.ceil(comments.repliesIds.length / limit),
					currentPage: parseInt(page),
				});

		} else {
		const post = await PostModel.findById(postId).populate(
			'commentsSection.commentsIds'
		);
		if (!post) return res.status(404).json({error: 'Post not found'});

		const skip = (page - 1) * limit;
		const comments = await Comment.find({
			_id: {$in: post.commentsSection.commentsIds},
			parentCommentId

		})
			.sort({createdAt: -1})
			.skip(skip)
			.limit(parseInt(limit))
			.populate({
				path: 'authorId',
				model: 'User',
				select: 'nickname avatar id',
			})
			.populate({
				path: 'repliesIds',
				model: 'Comment',
				populate: {
					path: 'authorId',
					model: 'User',
					select: 'nickname avatar id',
				},
			})
			.lean();
		let shouldReverse = false;

		const processedComments = comments.flatMap((comment, idx) => {
			// const prevHasDifferentAuthor =
			// 	idx > 0 &&
			// 	comments[idx - 1]?.authorId._id !== comment.authorId._id;

			// if (prevHasDifferentAuthor) {
			// 	shouldReverse = !shouldReverse;
			// }

			return {
				...comment,
				// shouldReverse,
			};
		});
		const totalComments = await Comment.countDocuments({
			_id: {$in: post.commentsSection.commentsIds},
		});

		res.status(200).json({
			comments: processedComments,
			totalComments,
			totalPages: Math.ceil(totalComments / limit),
			currentPage: parseInt(page),
		});
		}
	} catch (error) {
		res.status(500).json({error: error.message});
	}
};

// Get paginated replies for a comment
const getPaginatedReplies = async (req, res) => {
	const {postModel, postId, commentId} = req.params;
	const {page = 1, limit = 10} = req.query; // Default to page 1, limit 10

	try {
		const skip = (page - 1) * limit;
		const comment = await Comment.findById(commentId).populate(
			'repliesIds'
		);
		if (!comment) return res.status(404).json({error: 'Comment not found'});

		const replies = await Comment.find({_id: {$in: comment.repliesIds}})
			.sort({createdAt: -1})
			.skip(skip)
			.limit(parseInt(limit));

		const totalReplies =
			(await Comment.countDocuments({_id: {$in: comment.repliesIds}})) -
			3;

		res.status(200).json({
			replies,
			totalReplies,
			totalPages: Math.ceil(totalReplies / limit),
			currentPage: parseInt(page),
		});
	} catch (error) {
		res.status(500).json({error: error.message});
	}
};

module.exports = {
	addCommentOrReply,
	getCommentsAndReplies,
	getPaginatedComments,
};

const express = require('express');
const {check, validationResult} = require('express-validator');
const News = require('../models/news');
const {getWarsawTime} = require('../consts/constant');
const saveImage = require('../consts/saveImage');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const {get} = require('http');
require('dotenv').config();

const getPathToFile = (file) => {
	const email = file.originalname.split(' ')[0];
	const uploadPath = `public/assets/img/${email}`;
	fs.mkdirSync(uploadPath, {recursive: true});
	return uploadPath;
};
const getFileName = (file) => {
	const date = getWarsawTime().split('T')[0];
	const fileName = file.originalname.split(' ')[1];
	return `${date}_${fileName}`;
};

function replaceImgUrlsByOrder(html, newUrls) {
	let imgTagPattern = /(<img\b[^>]*?\bsrc=")[^"]*(")/g;
	let match;
	let index = 1; // Skip the first image tag, because it's the featured image

	// Replace each img tag src attribute in order
	html = html.replace(imgTagPattern, (match, p1, p2) => {
		if (index < newUrls.length) {
			return `${p1}${process.env.PUBLIC_URL}${newUrls[index++].url}${p2}`;
		} else {
			return match;
		}
	});

	return html;
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, getPathToFile(file)); // Adjust the destination as needed
	},
	filename: (req, file, cb) => {
		cb(null, getFileName(file));
	},
});

const upload = multer({
	storage: storage,
	limits: {fileSize: 10 * 1024 * 1024}, // 10 MB limit
}).array('files', 10);

const newsProposalRules = [
	// check('files')
	// 	.isArray()
	// 	.withMessage('Pliki powinny być tablicą')
	// 	.notEmpty()
	// 	.withMessage('Pliki są wymagane'),
	check('title')
		.isString()
		.isLength({min: 3, max: 100})
		.withMessage('Tytuł musi mieć od 3 do 100 znaków'),
	check('intro')
		.isString()
		.isLength({min: 10, max: 500})
		.withMessage('Wstęp musi mieć od 10 do 500 znaków'),
	check('content')
		.isString()
		.isLength({min: 10, max: 5000})
		.withMessage('Treść musi mieć od 10 do 5000 znaków'),
	check('nickname')
		.isString()
		.isLength({min: 3, max: 50})
		.withMessage('Nick musi mieć od 3 do 50 znaków'),
	check('email').isEmail().withMessage('Musisz podać poprawny adres email'),
];

const createNewsProposal = async (req, res) => {
	upload(req, res, async (error) => {
		if (error instanceof multer.MulterError) {
			return res.status(400).json({error: error.message});
		} else if (error) {
			return res.status(500).json({error: error.message});
		}
		const errors = validationResult(req.body);
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()});
		}

		const filesToUpload = [];
		const currentDate = getWarsawTime();
		const {title, intro, content, nickname, email, tags, filesDetails} =
			req.body;
		const files = req.files;

		try {
			files.forEach((file) => {
				const fileName = getFileName(file);
				const imageUrl = path.join(
					email,
					// formattedDate,
					fileName
				);
				const fileToUpload = {
					name: fileName,
					size: file.size,
					url: imageUrl,
				};

				filesToUpload.push(fileToUpload);
			});
			const replacedContent = replaceImgUrlsByOrder(
				content,
				filesToUpload
			);

			const newNewsProposal = new News({
				title,
				intro,
				files: filesToUpload[0],
				content: replacedContent, /* content with replaced img urls
				                            we only need the first image above, because:
				                            its the face of the article */
				nickname,
				email,
				tags,
				date: currentDate,
				confirmed: false,
				confirmationToken: `${Math.random()
					.toString(36)
					.substring(2, 15)}`,
			});

			await newNewsProposal.save();
			res.status(201).json({message: 'News wysłany do akceptacji'});
		} catch (error) {
			res.status(500).json({error: error.message});
		}
	});
};
// const createNewsProposal = async (req, res) => {
// 	upload(req, res, async (error) => {
// 		if (error instanceof multer.MulterError) {
// 			return res.status(400).json({ error: error.message });
// 		  } else if (error) {
// 			return res.status(500).json({ error: error.message });
// 		  }
// 	console.log('req.body', req.body);
// 	const errors = validationResult(req);
// 	if (!errors.isEmpty()) {
// 		return res.status(400).json({errors: errors.array()});
// 	}
// 	const filesToUpload = [];
// 	const currentDate = getWarsawTime();
// 	const {title, intro, content, nickname, email, tags, files} = req.body;
// 	await Promise.all(files.forEach( async (fileFromReq) => {
// 		const {file, ...rest} = fileFromReq;
// 		const formattedDate = `${currentDate.split('T')[0]}`
// 		// const imageUrl = path.join(`${process.env.FILE_PATH}`, formattedDate, rest.name);
// 		const imageUrl = path.join(email, formattedDate, rest.name);
// 		const fileToUpload = {
// 			...rest,
// 			url: imageUrl,
// 		}
// 		filesToUpload.push(fileToUpload);
// 		await saveImage(file, '/', rest.name)
// 	}))
// 	// const filesWithUpdatedUrl = files.map(async (fileFromReq) => {
// 	// 	const {file, ...rest} = fileFromReq;
// 	// 	const formattedDate = `${currentDate.split('T')[0]}`
// 	// 	const imageUrl = path.join(`${process.env.FILE_PATH}`, formattedDate);
// 	// 	await saveImage(file, imageUrl, rest.name);
// 	// 	return {
// 	// 		...rest,
// 	// 		url: imageUrl,
// 	// 	};
// 	// });
// 	try {
// 		const newNewsProposal = new News({
// 			title,
// 			intro,
// 			content,
// 			files: filesToUpload,
// 			nickname,
// 			email,
// 			tags,
// 			date: currentDate,
// 			confirmed: false,
// 			confirmationToken: `${Math.random().toString(36).substring(2, 15)}`,
// 		});

// 		await newNewsProposal.save();
// 		// .then(res.json(`proposal succeeded! ${newNews}`))
// 		// .catch((error) => res.json(`proposal failed! ${error}`));
// 		res.status(201).json({message: 'News wysłany do akceptacji'});
// 	} catch (error) {
// 		res.status(error.status).json({error});
// 	}
// })
// };

// const createNewsProposal = async (req, res) => {
// 	console.log('req.body', req.body);
// 	const errors = validationResult(req);
// 	if (!errors.isEmpty()) {
// 		return res.status(400).json({errors: errors.array()});
// 	}
// 	const filesToUpload = [];
// 	const currentDate = getWarsawTime();
// 	const {title, intro, content, nickname, email, tags, files} = req.body;
// 	await Promise.all(files.forEach( async (fileFromReq) => {
// 		const {file, ...rest} = fileFromReq;
// 		const formattedDate = `${currentDate.split('T')[0]}`
// 		// const imageUrl = path.join(`${process.env.FILE_PATH}`, formattedDate, rest.name);
// 		const imageUrl = path.join(email, formattedDate, rest.name);
// 		const fileToUpload = {
// 			...rest,
// 			url: imageUrl,
// 		}
// 		filesToUpload.push(fileToUpload);
// 		await saveImage(file, '/', rest.name)
// 	}))
// 	// const filesWithUpdatedUrl = files.map(async (fileFromReq) => {
// 	// 	const {file, ...rest} = fileFromReq;
// 	// 	const formattedDate = `${currentDate.split('T')[0]}`
// 	// 	const imageUrl = path.join(`${process.env.FILE_PATH}`, formattedDate);
// 	// 	await saveImage(file, imageUrl, rest.name);
// 	// 	return {
// 	// 		...rest,
// 	// 		url: imageUrl,
// 	// 	};
// 	// });
// 	try {
// 		const newNewsProposal = new News({
// 			title,
// 			intro,
// 			content,
// 			files: filesToUpload,
// 			nickname,
// 			email,
// 			tags,
// 			date: currentDate,
// 			confirmed: false,
// 			confirmationToken: `${Math.random().toString(36).substring(2, 15)}`,
// 		});

// 		await newNewsProposal.save();
// 		// .then(res.json(`proposal succeeded! ${newNews}`))
// 		// .catch((error) => res.json(`proposal failed! ${error}`));
// 		res.status(201).json({message: 'News wysłany do akceptacji'});
// 	} catch (error) {
// 		res.status(error.status).json({error});
// 	}
// };

const getNewsProposals = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const pageSize = parseInt(req.query.pageSize) || 18;
	try {
		const newsProposals = await News.find({confirmed: false});
		const newsProposalsPaginated = await News.find(
			{confirmed: false},
			'title intro content files nickname tags date'
		)
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.sort({date: -1});
		const totalNewsProposals = newsProposals.length;
		console.log('newsProposalsPaginated', totalNewsProposals);

		res.status(200).json({
			news: newsProposalsPaginated,
			totalNews: totalNewsProposals,
			page,
			pageSize,
			totalPages: Math.ceil(totalNewsProposals / pageSize),
		});
	} catch (error) {
		res.status(500).json({error});
	}
};

module.exports = {newsProposalRules, createNewsProposal, getNewsProposals};

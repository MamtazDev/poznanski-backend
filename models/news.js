const mongoose = require('mongoose');
const { commentsSectionSchema } = require('./comment');

const Schema = mongoose.Schema;

const FileToSave = new Schema({
	name: {type: String, required: true},
	url: {type: String, required: true},
	size: {type: Number, required: true},
});


const newsSchema = new Schema(
	{
		title: {type: String, required: true},
		intro: {type: String, required: true},
		content: {type: String, required: true},
		files: [{type: FileToSave, required: true}],
		nickname: {type: String, required: true},
		email: {type: String, required: true},
		tags: {type: String},
		date: {type: Date},
		confirmed: {type: Boolean, default: false},
		confirmationToken: {type: String},
		commentsSection: commentsSectionSchema,
	},
	{timestamps: true}
);

module.exports = mongoose.model('News', newsSchema);

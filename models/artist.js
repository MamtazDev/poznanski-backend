const mongoose = require('mongoose');

const Schema = mongoose.Schema

const artistSchema = new Schema({
    name: { type: String, required: true },
    profileImg: { type: String, required: true },
    description: { type: String, default: "" },
    star: { type: Number, default: 0 }
});

module.exports = mongoose.model('Artist', artistSchema);
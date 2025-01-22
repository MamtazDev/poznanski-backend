const mongoose = require('mongoose');

const Schema = mongoose.Schema

const logoSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    img1: { type: String, default: '' },
    img2: { type: String, default: '' },
});

module.exports = mongoose.model('Logo', logoSchema);
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const subscribeSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String },
}, { timestamps: true });

export default mongoose.model('Subscribe', subscribeSchema);
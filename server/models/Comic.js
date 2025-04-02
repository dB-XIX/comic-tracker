const mongoose = require('mongoose');

const ComicSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    issue: { type: String },
    publisher: { type: String },
    grade: { type: String },
    notes: { type: String },
    image: { type: String }, // optional: image URL
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comic', ComicSchema);

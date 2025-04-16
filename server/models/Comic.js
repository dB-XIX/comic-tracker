const mongoose = require('mongoose');

const ComicSchema = new mongoose.Schema({
    title: String,
    seriesTitle: String,
    issue: String,
    year: String,
    publisher: String,
    grade: String,
    notes: String,
    image: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ebayAverage: { type: Number },
    ebaySales: [
        {
            price: Number,
            date: Date,
        }
    ],
    lastEbayUpdate: { type: Date },
    wantList: { type: Boolean, default: false },
});

module.exports = mongoose.model('Comic', ComicSchema);

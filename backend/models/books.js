const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ['AVAILABLE', 'BORROWED'], default: 'AVAILABLE' },
    numberOfCopies: { type: Number, required: true, default: 1 }, // New attribute
    borrowedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }] // Change to an array of ObjectIds
});

module.exports = mongoose.model('Book', BookSchema); // Changed model name to 'Book' for consistency

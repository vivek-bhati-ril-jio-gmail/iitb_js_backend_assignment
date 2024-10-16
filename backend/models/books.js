const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ['AVAILABLE', 'BORROWED'], default: 'AVAILABLE' },
    numberOfCopies: { type: Number, required: true, default: 1 }, // New attribute
    borrowedBy: [{
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
        action: { type: String, enum: ['BORROWED', 'RETURNED'] },
        date: { type: Date, default: Date.now }
    }] // Change to an array of ObjectIds
});

// Method to find if a book is borrowed by a specific user
BookSchema.methods.isBorrowedByUser = function(memberId) {
    return this.borrowedBy.some(borrow => borrow.userID.equals(memberId));
};

module.exports = mongoose.model('Book', BookSchema); // Changed model name to 'Book' for consistency

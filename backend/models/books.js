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

// Method to get the difference between BORROWED and RETURNED
BookSchema.methods.getAvailableCount = function() {
    const borrowedCount = this.borrowedBy.filter(borrow => borrow.action === 'BORROWED').length;
    const returnedCount = this.borrowedBy.filter(borrow => borrow.action === 'RETURNED').length;

    return this.numberOfCopies - (borrowedCount - returnedCount); // Difference between borrowed and returned
};

module.exports = mongoose.model('Book', BookSchema); // Changed model name to 'Book' for consistency

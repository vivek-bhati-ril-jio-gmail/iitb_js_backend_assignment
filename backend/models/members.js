const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    history: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        action: { type: String, enum: ['BORROWED', 'RETURNED'] },
        date: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['LIBRARIAN', 'MEMBER'], required: true }
});

module.exports = mongoose.model('members', MemberSchema);
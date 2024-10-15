const express = require('express');
const Book = require('../models/books');
const auth = require('../middleware/authentication');
const Members = require('../models/members');
const router = express.Router();

// Add a Book (Librarian Only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'LIBRARIAN') return res.status(403).json({ msg: 'Access denied' });
    const { title, author, numberOfCopies } = req.body;

    if (!title || !author || !numberOfCopies) {
        return res.status(400).json({ msg: 'Please provide title, author, and number of copies.' });
    }
    try {
        console.log(title, author, numberOfCopies);
        const book = new Book({ 
            title: title,
            author: author,
            status: 'AVAILABLE',
            numberOfCopies: numberOfCopies,
            borrowedBy: []
        });
        await book.save();
        res.status(201).json({ book:book, msg: 'Book added successfully'});
    } catch (err) {
        res.status(500).json({ msg: 'Error adding book' });
    }
});

// Update a Book (Librarian Only)
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'LIBRARIAN') return res.status(403).json({ msg: 'Access denied' });
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(book);
    } catch (err) {
        res.status(500).json({ msg: 'Error updating book' });
    }
});

// Remove a Book (Librarian Only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'LIBRARIAN') return res.status(403).json({ msg: 'Access denied' });
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Book has been removed.' });
    } catch (err) {
        res.status(500).json({ msg: 'Error removing book' });
    }
});

// View All Books with Pagination
router.get('/', auth, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided

    const skip = (page - 1) * limit; // Calculate the number of records to skip

    try {
        const books = await Book.find().skip(skip).limit(limit);
        const totalBooks = await Book.countDocuments(); // Get the total number of books

        res.json({
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
            currentPage: page,
            books,
        });
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching books' });
    }
});

// Borrow a Book (Member Only)
router.post('/borrow/:bookId', auth, async (req, res) => {
    const bookId = req.params.bookId;
    const memberId = req.user.id;

    try {
        const book = await Book.findById(bookId);
        if (!book
            || book.status === 'BORROWED'
            || book.numberOfCopies <= 0
            || book.borrowedBy.includes(memberId)) {
            return res.status(400).json({ msg: 'Book not available or already borrowed by the user' });
        }

        // If max number of books are borrowed
        if (book.borrowedBy.length == book.numberOfCopies) {
            book.status = 'BORROWED';
        }

        book.borrowedBy.push({
            userID: memberId,
            action: 'BORROWED'
        }); // Add the member ID to the borrowedBy list
        await book.save();

        // Update member's borrowedBooks
        const member = await Members.findById(memberId);
        member.borrowedBooks.push(bookId); // Add the book ID to borrowedBooks
        member.history.push({ bookId, action: 'BORROWED' });
        await member.save();

        res.json({ msg: 'Book borrowed', title: book.title });
    } catch (err) {
        res.status(500).json({ msg: 'Error borrowing book' });
    }
});

// Return a Book (Member Only)
router.post('/return/:bookId', auth, async (req, res) => {
    const bookId = req.params.bookId;
    const memberId = req.user.id;
    try {
        const book = await Book.findById(bookId);
        if (!book || book.numberOfCopies <= 0 || !book.borrowedBy.includes(memberId)) {
            return res.status(400).json({ msg: 'Book not borrowed or not available' });
        }

        // Update book status
        book.status = 'AVAILABLE';
        book.borrowedBy = book.borrowedBy.filter(id => id.toString() !== memberId); // Remove the member ID from the borrowedBy list
        await book.save();

        // Update member's borrowedBooks
        const member = await Members.findById(memberId);
        member.borrowedBooks = member.borrowedBooks.filter(b => b.toString() !== bookId); // Remove the book ID from borrowedBooks
        member.history.push({ bookId, action: 'RETURNED' });
        await member.save();

        res.json({ msg: 'Book returned', title: book.title });
    } catch (err) {
        res.status(500).json({ msg: 'Error returning book' });
    }
});

// GET borrowed books for the logged-in user
router.get('/borrowed-books', auth, async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you are using a middleware to set req.user based on authenticated user
        const user = await Members.findById(userId).populate('borrowedBooks'); // Populate borrowedBooks to get book details

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.borrowedBooks);
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
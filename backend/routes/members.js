const express = require('express');
const bcrypt = require('bcryptjs');
const Member = require('../models/members');
const Book = require('../models/books');
const auth = require('../middleware/authentication');
const router = express.Router();

// Add a Member (Librarian Only)
router.post('/', auth, async (req, res) => {
    // Check if the logged-in user is a Librarian
    if (req.user.role !== 'LIBRARIAN') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const { username, password, email } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Please provide username, email, and password' });
    }

    try {
        // Check if a member with the same username or email already exists
        const existingMember = await Member.findOne({ $or: [{ username }, { email }] });

        if (existingMember) {
            return res.status(400).json({ msg: 'Member with this username or email already exists' });
        }

        // Create a new member
        const member = new Member({
            username,
            password: await bcrypt.hash(password, 10), // Hash the password
            email
        });

        // Save the member to the database
        await member.save();
        return res.status(201).json({ msg: 'Member created', member });
    } catch (err) {
        console.error(err); // Log error for debugging
        return res.status(500).json({ msg: 'Error creating member' });
    }
});

// Update a Member (Librarian Only)
router.put('/:id', auth, async (req, res) => {
    // Check if the logged-in user is a Librarian
    if (req.user.role !== 'LIBRARIAN') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const { password, email } = req.body;
    const memberId = req.params.id;

    // Basic validation
    if (!email) {
        return res.status(400).json({ msg: 'Please provide email' });
    }

    try {
        // Find the member by ID
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ msg: 'Member not found' });
        }

        // Update member details
        member.email = email; // Update email

        if (password) {
            member.password = await bcrypt.hash(password, 10); // Update password if provided
        }

        // Save the updated member to the database
        await member.save();
        return res.status(200).json({ msg: 'Member updated', member });
    } catch (err) {
        console.error(err); // Log error for debugging
        return res.status(500).json({ msg: 'Error updating member' });
    }
});

// View All Members (Librarian Only)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'LIBRARIAN') return res.status(403).json({ msg: 'Access denied' });
    try {
        const members = await Member.find();
        res.json(members);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching members' });
    }
});

// Remove a Member (Librarian Only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'LIBRARIAN') return res.status(403).json({ msg: 'Access denied' });
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Member removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Error removing member' });
    }
});

// View Member History (Librarian Only)
router.get('/:id/history', auth, async (req, res) => {
    if (req.user.role !== 'LIBRARIAN') return res.status(403).json({ msg: 'Access denied' });
    try {
        const member = await Member.findById(req.params.id).populate('history.bookId');
        res.json(member.history);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching member history' });
    }
});

// View Member Borrowing History (Member Only)
router.get('/myhistory', auth, async (req, res) => {
    try {
        const member = await Member.findById(req.user.id).populate('history.bookId');
        res.json(member.history);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching your history' });
    }
});

// Delete Member Account (Member Only)
router.delete('/myaccount', auth, async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.user.id);
        res.json({ msg: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting account' });
    }
});

module.exports = router;
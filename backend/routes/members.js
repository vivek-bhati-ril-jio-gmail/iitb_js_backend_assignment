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

    const { username, password, email, role} = req.body;

    // Basic validation
    if (!username || !email || !password || !role) {
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
            username: username,
            password: await bcrypt.hash(password, 10), // Hash the password
            email: email,
            borrowedBooks: [],
            history: [],
            isActive: true,
            role: role
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

    const { username, email, isActive } = req.body;
    const memberId = req.params.id;

    // Basic validation
    if (!username || !email || !isActive) {
        return res.status(400).json({ msg: 'Please provide correct details' });
    }

    try {
        // Find the member by ID
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ msg: 'Member not found' });
        }

        // Update member details
        member.username = username; // Update username
        member.email = email; // Update email
        member.isActive = isActive === 'active' ? true : false; // Update active status

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
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided

        const skip = (page - 1) * limit; // Calculate the number of records to skip
        const members = await Member.find().skip(skip).limit(limit);
        const totalMembers = await Member.countDocuments(); // Get the total number of members

        res.json({
            totalUsers: totalMembers,
            totalPages: Math.ceil(totalMembers / limit),
            currentPage: page,
            users: members,
        });
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching members' });
    }
});

// Remove a Member (Librarian Only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'LIBRARIAN') return res.status(403).json({ msg: 'Access denied' });
    try {
        const memberId = req.params.id;
        // Find the member by ID
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ msg: 'Member not found.' });
        }
        if (member.role !== 'LIBRARIAN') {
            await Member.findByIdAndDelete(memberId);
            res.status(200).json({ msg: 'Member removed.' });
        } else {
            res.status(200).json({ msg: 'Librarians cannot be removed.' });
        }
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
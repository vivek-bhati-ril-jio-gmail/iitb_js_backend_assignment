const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Members = require('../models/members');
const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    const { username, password, email, role } = req.body;
    // Basic validation
    if (!username || !email || !password || !role) {
        return res.status(400).json({ msg: 'Please provide username, email, and password' });
    }
    
    try {
        // Check if a member with the same username or email already exists
        const existingMember = await Members.findOne({ $or: [{ username }, { email }] });

        if (existingMember) {
            return res.status(400).json({ msg: 'Member with this username or email already exists' });
        }

        // Create a new member
        const member = new Members({
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
        return res.status(201).json({ msg: 'User created', member });
    } catch (err) {
        res.status(500).json({ msg: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Members.findOne({ username });

        if (!user) {
            return res.status(401).json({ msg: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password); // Assuming you hash passwords
        // const isMatch = password == user.password;

        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid password' });
        }

        // Create and sign the JWT
        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

        var response = { jwt: token, role: user.role};
        return res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    // Here you would typically invalidate the token, if needed
    // Since JWT is stateless, just inform the client to remove the token
    res.json({ msg: 'Successfully logged out' });
});


module.exports = router;
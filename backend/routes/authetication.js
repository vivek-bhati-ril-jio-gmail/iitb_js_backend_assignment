const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Members = require('../models/members');
const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        password = await bcrypt.hash(password, 10);
        const user = new Members({
            username,
            password: password,
            role
        });
        await user.save();
        res.status(201).json({ msg: 'User created' });
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
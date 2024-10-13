const jwt = require('jsonwebtoken');
const Members = require('../models/members');

const authentication = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch user from the database to check the current role
        const user = await Members.findById(decoded.user.id);
        if (!user) return res.status(401).json({ msg: 'User not found' });

        req.user = user; // Attach the user object to the request
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authentication;
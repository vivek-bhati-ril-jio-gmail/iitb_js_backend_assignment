const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connection');
const authRoutes = require('./routes/authetication');
const bookRoutes = require('./routes/books');
const memberRoutes = require('./routes/members');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// Use CORS
app.use(cors());
app.use(express.json()); // For parsing application/json

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);

// Home route for checking server
app.get('/', (req, res) => {
    res.send('Library Management System API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
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
// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Home route for checking server
app.get('/', (req, res) => {
    res.send('Library Management System API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);

// Start the server
const PORT = process.env.PORT || 5000;

// Define your API routes here

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
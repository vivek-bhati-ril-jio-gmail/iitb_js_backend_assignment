const mongoose = require('mongoose');
require('dotenv').config();
const seedDatabase = require('./seed'); // Adjust the path to where your seed.js is located

const database_connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        // Call the seedDatabase function after connection
        await seedDatabase();
        console.log('Database seeded'); // Log if seeding was successful
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = database_connection;

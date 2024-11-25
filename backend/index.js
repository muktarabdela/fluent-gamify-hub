const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const routes = require('./routes');

dotenv.config();
require('./bot/bot');

const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

// Start server after database connection
const startServer = async () => {
    try {
        // Initialize database connection
        await connectDB();
        console.log('Database connection established');

        // Use routes
        app.use('/api', routes);

        // Health check endpoint
        app.get('/api', (req, res) => {
            res.send('Server is running');
        });

        app.listen(5000, () => {
            console.log('Server running on port 5000');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { SECURITY_CONFIG, SECURITY_HEADERS } = require('./config/security');

dotenv.config();
require('./bot/bot');

const app = express();

// Move CORS before other middleware
app.use(cors({
    origin: ['http://localhost:8080', 'https://fluent-gamify-hub-production.up.railway.app', 'https://fluent-gamify-hub.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Other middleware
app.use(helmet());
app.use(express.json({ limit: SECURITY_CONFIG.MAX_REQUEST_SIZE }));

// // Rate limiting configuration - make it more lenient for development
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//     message: 'Too many requests from this IP, please try again later'
// });

// // Apply rate limiting after CORS
// app.use('/api/', limiter);

// Add custom security headers
app.use((req, res, next) => {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    next();
});

// Start server after database connection
const startServer = async () => {
    try {
        await connectDB();
        console.log('Database connection established');

        // Use routes with Telegram validation
        app.use('/fluent/api', routes);

        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.send('Server is running');
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

startServer();

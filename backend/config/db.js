const mongoose = require('mongoose');

let dbConnection = null;

const validateEnvVars = () => {
    const requiredEnvVars = ['MONGODB_URI'];
    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            throw new Error(`Environment variable ${envVar} is not set`);
        }
    });
};

const connectDB = async () => {
    try {
        validateEnvVars();
        dbConnection = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Database Connected Successfully');
        return dbConnection;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

// Get connection instance
const getConnection = () => {
    if (!dbConnection) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return dbConnection;
};

module.exports = {
    connectDB,
    getConnection
};

const mysql = require('mysql2');
const { tableQueries } = require('../model/sql');

let pool = null;

// First, create a connection without database selection
const initialConnection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD
});

// Create connection pool (will be used after database is created)
const createPool = () => {
    return mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'fluenthub',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }).promise();
};

// Initialize all tables - Commented out by default
const initializeTables = async (promisePool) => {
    try {
        // Create tables in the correct order due to foreign key constraints
        const tables = [
            // Uncomment these lines to create tables
            // { name: 'Units', query: tableQueries.createUnitsTable },
            // { name: 'Lessons', query: tableQueries.createLessonsTable },
            // { name: 'Dialogues', query: tableQueries.createDialoguesTable },
            // { name: 'Exercises', query: tableQueries.createExercisesTable },
            // { name: 'UserProgress', query: tableQueries.createUserProgressTable }
        ];

        for (const table of tables) {
            await promisePool.query(table.query);
            console.log(`${table.name} table initialized successfully`);
        }

    } catch (error) {
        console.error('Error initializing tables:', error.message);
        throw error;
    }
};

// Test connection and initialize database and tables
const connectDB = async () => {
    try {
        // Create database if it doesn't exist
        await new Promise((resolve, reject) => {
            initialConnection.query(
                `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'fluenthub'}`,
                (err) => {
                    if (err) reject(err);
                    console.log('Database created or already exists');
                    resolve();
                }
            );
        });

        // Close initial connection
        initialConnection.end();

        // Create pool with database selected
        pool = createPool();

        // Test connection
        const connection = await pool.getConnection();
        console.log('MySQL Database Connected Successfully');
        connection.release();

        // Initialize tables (commented out by default)
        // Uncomment the next line to create tables
        // await initializeTables(pool);
        // console.log('All tables initialized successfully');

        return pool;

    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        process.exit(1);
    }
};

// Get pool instance
const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return pool;
};

module.exports = {
    connectDB,
    getPool
};

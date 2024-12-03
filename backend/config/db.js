const mysql = require('mysql2');
const { tableQueries } = require('../model/sql');

let pool = null;

// Create connection pool using Railway's MySQL credentials
const createPool = () => {
    return mysql.createPool({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }).promise();
};

// Initialize all tables
const initializeTables = async (promisePool) => {
    try {
        const tables = [
            { name: 'Units', query: tableQueries.createUnitsTable },
            { name: 'Lessons', query: tableQueries.createLessonsTable },
            { name: 'Dialogues', query: tableQueries.createDialoguesTable },
            { name: 'Exercises', query: tableQueries.createExercisesTable },
            { name: 'Users', query: tableQueries.createUsersTable },
            { name: 'UserProgress', query: tableQueries.createUserProgressTable },
            { name: 'UserStreaks', query: tableQueries.createStreaksTable },
            { name: 'LiveSessions', query: tableQueries.createLiveSessionsTable },
            { name: 'TelegramGroups', query: tableQueries.createTelegramGroupsTable },
            { name: 'QuickLessons', query: tableQueries.createQuickLessonsTable },
            { name: "LiveSessionParticipants", query: tableQueries.createLiveSessionParticipantsTable },
            { name: "LessonStatus", query: tableQueries.createLessonStatusTable },
            { name: 'Topics', query: tableQueries.createTopicsTable },
            { name: 'Categories', query: tableQueries.createCategoriesTable },
            { name: 'ExerciseTypes', query: tableQueries.createExerciseTypesTable },
            { name: 'PracticeExercises', query: tableQueries.createPracticeExercisesTable }
        ];

        for (const table of tables) {
            try {
                await promisePool.query(table.query);
                console.log(`${table.name} table initialized successfully`);
            } catch (error) {
                console.error(`Error creating ${table.name} table:`, error.message);
                // Continue with other tables even if one fails
            }
        }
    } catch (error) {
        console.error('Error initializing tables:', error.message);
        throw error;
    }
};

// Connect to database and initialize tables
const connectDB = async () => {
    try {
        // Create pool with Railway's MySQL credentials
        pool = createPool();

        // Test connection
        const connection = await pool.getConnection();
        console.log('MySQL Database Connected Successfully');
        connection.release();

        // Initialize tables
        await initializeTables(pool);
        console.log('All tables initialized successfully');

        return pool;
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        throw error; // Let the application handle the error
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

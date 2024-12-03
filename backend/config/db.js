const mysql = require('mysql2');
const { tableQueries } = require('../model/sql');

let pool = null;

const createPool = () => {
    console.log('Attempting to connect with:', {
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT,
        user: process.env.MYSQLUSER,
        database: process.env.MYSQLDATABASE
    });

    return mysql.createPool({
        host: process.env.MYSQLHOST || 'localhost',
        port: parseInt(process.env.MYSQLPORT) || 3306,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        ssl: {
            rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }).promise();
};

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

const connectDB = async () => {
    try {
        // Create pool with Railway's MySQL credentials
        pool = createPool();

        // Test connection
        const connection = await pool.getConnection();
        console.log('MySQL Database Connected Successfully');
        
        // Log successful connection details
        const [rows] = await connection.query('SELECT DATABASE() as db');
        console.log('Connected to database:', rows[0].db);
        
        connection.release();

        // Initialize tables
        await initializeTables(pool);
        return pool;
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        console.error('Connection details:', {
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT,
            user: process.env.MYSQLUSER,
            database: process.env.MYSQLDATABASE
        });
        throw error;
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

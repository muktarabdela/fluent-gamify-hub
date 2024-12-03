const mysql = require('mysql2');
const { tableQueries } = require('../model/sql');

let pool = null;

const createPool = () => {
    const config = {
        host: process.env.MYSQLHOST,
        port: parseInt(process.env.MYSQLPORT),
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        ssl: {
            rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    console.log('MySQL Config:', {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database
    });

    return mysql.createPool(config).promise();
};

const initializeTables = async (promisePool) => {
    try {
        // First drop and recreate problematic tables
        try {
            await promisePool.query(tableQueries.dropTables);
            console.log('Dropped existing tables successfully');
        } catch (error) {
            console.log('No tables to drop or error dropping tables:', error.message);
        }

        // Then create tables in correct order
        const tables = [
            // Independent tables first
            { name: 'Units', query: tableQueries.createUnitsTable },
            { name: 'Topics', query: tableQueries.createTopicsTable },
            { name: 'Categories', query: tableQueries.createCategoriesTable },
            { name: 'TelegramGroups', query: tableQueries.createTelegramGroupsTable },
            { name: 'Users', query: tableQueries.createUsersTable },
            
            // Tables with single dependencies
            { name: 'Lessons', query: tableQueries.createLessonsTable },
            { name: 'ExerciseTypes', query: tableQueries.createExerciseTypesTable },
            { name: 'UserStreaks', query: tableQueries.createStreaksTable },
            
            // Tables with multiple dependencies
            { name: 'Dialogues', query: tableQueries.createDialoguesTable },
            { name: 'Exercises', query: tableQueries.createExercisesTable },
            { name: 'QuickLessons', query: tableQueries.createQuickLessonsTable },
            { name: 'UserProgress', query: tableQueries.createUserProgressTable },
            { name: 'LiveSessions', query: tableQueries.createLiveSessionsTable },
            { name: 'LiveSessionParticipants', query: tableQueries.createLiveSessionParticipantsTable },
            { name: 'LessonStatus', query: tableQueries.createLessonStatusTable },
            { name: 'PracticeExercises', query: tableQueries.createPracticeExercisesTable }
        ];

        for (const table of tables) {
            try {
                await promisePool.query(table.query);
                console.log(`${table.name} table initialized successfully`);
            } catch (error) {
                console.error(`Error creating ${table.name} table:`, error.message);
                throw error;
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

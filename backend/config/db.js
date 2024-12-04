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
        // Reorder tables based on dependencies
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
                // If it's a critical table, throw the error
                if (['Users', 'Units', 'TelegramGroups'].includes(table.name)) {
                    throw error;
                }
                // Otherwise continue with other tables
            }
        }
    } catch (error) {
        console.error('Error initializing tables:', error.message);
        throw error;
    }
};

// const dropAllTables = async (pool) => {
//     try {
//         // Disable foreign key checks temporarily
//         await pool.query('SET FOREIGN_KEY_CHECKS = 0');

//         // Get all table names
//         const [tables] = await pool.query('SHOW TABLES');

//         // Drop each table
//         for (const tableRow of tables) {
//             const tableName = tableRow[Object.keys(tableRow)[0]];
//             await pool.query(`DROP TABLE IF EXISTS ${tableName}`);
//             console.log(`Dropped table: ${tableName}`);
//         }

//         // Re-enable foreign key checks
//         await pool.query('SET FOREIGN_KEY_CHECKS = 1');

//         console.log('All tables dropped successfully');
//     } catch (error) {
//         console.error('Error dropping tables:', error);
//         throw error;
//     }
// };

const connectDB = async () => {
    try {
        pool = createPool();
        const connection = await pool.getConnection();
        console.log('MySQL Database Connected Successfully');

        // // Drop all tables first (be careful with this!)
        // await dropAllTables(pool);

        // Then initialize tables
        // await initializeTables(pool);
        return pool;
    } catch (error) {
        console.error('Error:', error);
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

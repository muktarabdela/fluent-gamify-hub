const { getPool } = require('../config/db');

const userController = {
    // Create or update user from Telegram data
    createOrUpdateUser: async (req, res) => {
        const {
            id,
            username,
            first_name,
            last_name = null,
            auth_date
        } = req.body;

        if (!id || !first_name) {
            return res.status(400).json({
                message: 'User ID and first name are required'
            });
        }

        try {
            const pool = getPool();
            
            // Check if user exists
            const [existingUser] = await pool.query(
                'SELECT * FROM Users WHERE user_id = ?',
                [id]
            );

            if (existingUser.length === 0) {
                // Create new user
                await pool.query(
                    `INSERT INTO Users (
                        user_id, username, first_name, last_name, 
                        auth_date
                    ) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))`,
                    [id, username, first_name, last_name, auth_date]
                );

                // Initialize user progress for all available lessons
                await initializeUserProgress(id, pool);

                // Initialize user streak
                await pool.query(
                    `INSERT INTO UserStreaks (user_id, current_streak, longest_streak)
                    VALUES (?, 0, 0)`,
                    [id]
                );

                const [newUser] = await pool.query(
                    'SELECT * FROM Users WHERE user_id = ?',
                    [id]
                );

                res.status(201).json(newUser[0]);
            } else {
                // Update existing user
                await pool.query(
                    `UPDATE Users SET 
                        username = ?,
                        first_name = ?,
                        last_name = ?,
                        auth_date = FROM_UNIXTIME(?),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?`,
                    [username, first_name, last_name, auth_date, id]
                );

                const [updatedUser] = await pool.query(
                    'SELECT * FROM Users WHERE user_id = ?',
                    [id]
                );

                res.json(updatedUser[0]);
            }
        } catch (error) {
            console.error('Error creating/updating user:', error);
            res.status(500).json({
                message: 'Failed to create/update user',
                error: error.message
            });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const pool = getPool();
            const [user] = await pool.query(
                'SELECT * FROM Users WHERE user_id = ?',
                [req.params.id]
            );

            if (user.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user[0]);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const pool = getPool();
            const [users] = await pool.query('SELECT * FROM Users');
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update user preferences
    updateUserPreferences: async (req, res) => {
        const { preferences } = req.body;
        const { country, interests, onboarding_completed } = preferences;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                `UPDATE Users SET 
                    country = ?,
                    interests = ?,
                    onboarding_completed = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?`,
                [country, JSON.stringify(interests), onboarding_completed, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ 
                message: 'User preferences updated successfully',
                preferences: {
                    country,
                    interests,
                    onboarding_completed
                }
            });
        } catch (error) {
            console.error('Error updating user preferences:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM Users WHERE user_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get user progress
    getUserProgress: async (req, res) => {
        try {
            const pool = getPool();
            const [progress] = await pool.query(
                `SELECT 
                    up.*,
                    l.title as lesson_title,
                    u.title as unit_title,
                    u.order_number as unit_order
                FROM UserProgress up
                JOIN Lessons l ON up.lesson_id = l.lesson_id
                JOIN Units u ON l.unit_id = u.unit_id
                WHERE up.user_id = ?
                ORDER BY u.order_number, l.order_number`,
                [req.params.id]
            );

            res.json(progress);
        } catch (error) {
            console.error('Error fetching user progress:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update user progress
    updateUserProgress: async (req, res) => {
        const { lesson_id, exercise_id, status, score } = req.body;
        const user_id = req.params.id;

        try {
            const pool = getPool();
            
            // Insert or update progress
            await pool.query(
                `INSERT INTO UserProgress 
                    (user_id, lesson_id, exercise_id, status, score) 
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    score = VALUES(score)`,
                [user_id, lesson_id, exercise_id, status, score]
            );

            // Update streak
            await updateStreak(user_id, pool);

            // Get updated progress
            const [progress] = await pool.query(
                'SELECT * FROM UserProgress WHERE user_id = ? AND lesson_id = ?',
                [user_id, lesson_id]
            );

            res.json(progress[0]);
        } catch (error) {
            console.error('Error updating user progress:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get user streak
    getUserStreak: async (req, res) => {
        try {
            const pool = getPool();
            const [streak] = await pool.query(
                'SELECT * FROM UserStreaks WHERE user_id = ?',
                [req.params.id]
            );

            if (streak.length === 0) {
                // Initialize streak if it doesn't exist
                await pool.query(
                    'INSERT INTO UserStreaks (user_id) VALUES (?)',
                    [req.params.id]
                );
                return res.json({ 
                    current_streak: 0, 
                    longest_streak: 0,
                    last_activity_date: null 
                });
            }

            res.json(streak[0]);
        } catch (error) {
            console.error('Error fetching user streak:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Add this new method
    updateUserStreak: async (req, res) => {
        try {
            const pool = getPool();
            const userId = req.params.id;
            
            // Update the streak
            await updateStreak(userId, pool);
            
            // Get and return the updated streak
            const [streak] = await pool.query(
                'SELECT * FROM UserStreaks WHERE user_id = ?',
                [userId]
            );

            if (streak.length === 0) {
                return res.status(404).json({ message: 'Streak not found' });
            }

            res.json(streak[0]);
        } catch (error) {
            console.error('Error updating user streak:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

// Helper function to update streak
const updateStreak = async (userId, pool) => {
    const today = new Date().toISOString().split('T')[0];
    
    const [currentStreak] = await pool.query(
        'SELECT * FROM UserStreaks WHERE user_id = ?',
        [userId]
    );

    if (currentStreak.length === 0) {
        // Initialize streak
        await pool.query(
            `INSERT INTO UserStreaks 
                (user_id, current_streak, longest_streak, last_activity_date) 
            VALUES (?, 1, 1, ?)`,
            [userId, today]
        );
        return;
    }

    const streak = currentStreak[0];
    const lastDate = new Date(streak.last_activity_date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrentStreak = streak.current_streak;
    
    if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        // Consecutive day
        newCurrentStreak += 1;
    } else if (lastDate.toISOString().split('T')[0] !== today) {
        // Streak broken
        newCurrentStreak = 1;
    }

    await pool.query(
        `UPDATE UserStreaks SET 
            current_streak = ?,
            longest_streak = GREATEST(longest_streak, ?),
            last_activity_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [newCurrentStreak, newCurrentStreak, today, userId]
    );
}

// Helper function to initialize user progress
const initializeUserProgress = async (userId, pool) => {
    try {
        // Get all lessons
        const [lessons] = await pool.query(`
            SELECT l.lesson_id, l.unit_id, l.order_number
            FROM Lessons l
            ORDER BY l.unit_id, l.order_number
        `);

        if (lessons.length === 0) return;

        // Set first lesson as 'active' and others as 'locked'
        const firstLesson = lessons[0];
        
        // Initialize progress for first lesson as 'started'
        await pool.query(
            `INSERT INTO UserProgress (user_id, lesson_id, status, score)
            VALUES (?, ?, 'started', 0)`,
            [userId, firstLesson.lesson_id]
        );

        // Initialize remaining lessons as 'locked' (through default lesson status)
        const remainingLessons = lessons.slice(1);
        if (remainingLessons.length > 0) {
            const values = remainingLessons.map(lesson => 
                [userId, lesson.lesson_id, 'started', 0]
            );
            
            // Batch insert for better performance
            await pool.query(
                `INSERT INTO UserProgress 
                    (user_id, lesson_id, status, score)
                VALUES ?`,
                [values]
            );
        }

        console.log(`Initialized progress for user ${userId} with ${lessons.length} lessons`);
    } catch (error) {
        console.error('Error initializing user progress:', error);
        throw error;
    }
};

module.exports = userController; 
const { getPool } = require('../config/db');

// Move the helper function before the controller object
const unlockNextLesson = async (lessonId, userId, pool) => {
    try {
        // Get current lesson's unit and order
        const [currentLesson] = await pool.query(
            'SELECT unit_id, order_number FROM Lessons WHERE lesson_id = ?',
            [lessonId]
        );

        if (currentLesson.length === 0) return null;

        // Get next lesson in the same unit
        const [nextLesson] = await pool.query(
            `SELECT lesson_id FROM Lessons 
             WHERE unit_id = ? AND order_number > ?
             ORDER BY order_number ASC LIMIT 1`,
            [currentLesson[0].unit_id, currentLesson[0].order_number]
        );

        if (nextLesson.length > 0) {
            // Update next lesson's status to active
            await pool.query(
                `UPDATE LessonStatus 
                 SET status = 'active',
                 unlock_date = CURRENT_TIMESTAMP
                 WHERE lesson_id = ? AND user_id = ?`,
                [nextLesson[0].lesson_id, userId]
            );

            return nextLesson[0].lesson_id;
        }

        return null;
    } catch (error) {
        console.error('Error unlocking next lesson:', error);
        throw error;
    }
};

// Helper function to initialize lesson statuses
const initializeLessonStatuses = async (unitId, userId, pool) => {
    try {
        // Get all lessons in the unit that don't have a status
        const [lessonsWithoutStatus] = await pool.query(`
            SELECT l.lesson_id, l.unit_id, l.order_number
            FROM Lessons l
            LEFT JOIN LessonStatus ls ON l.lesson_id = ls.lesson_id AND ls.user_id = ?
            WHERE l.unit_id = ? AND ls.lesson_id IS NULL
            ORDER BY l.order_number
        `, [userId, unitId]);

        if (lessonsWithoutStatus.length === 0) return;

        // Create initial status records
        const values = lessonsWithoutStatus.map((lesson, index) => {
            // First lesson is 'active', rest are 'locked'
            const status = index === 0 ? 'active' : 'locked';
            return [lesson.lesson_id, lesson.unit_id, userId, status];
        });

        await pool.query(`
            INSERT INTO LessonStatus 
                (lesson_id, unit_id, user_id, status)
            VALUES ?`,
            [values]
        );

        console.log(`Initialized ${values.length} lesson statuses for unit ${unitId}`);
    } catch (error) {
        console.error('Error initializing lesson statuses:', error);
        throw error;
    }
};

const lessonController = {
    // Get all lessons for a specific unit
    getAllLessons: async (req, res) => {
        try {
            const pool = getPool();
            const { unitId } = req.query;
            let query = 'SELECT * FROM Lessons';
            let params = [];

            if (unitId) {
                query += ' WHERE unit_id = ?';
                params.push(unitId);
            }

            query += ' ORDER BY unit_id, order_number';

            const [lessons] = await pool.query(query, params);
            res.json(lessons);
        } catch (error) {
            console.error('Error fetching all lessons:', error);
            res.status(500).json({ message: error.message });
        }
    },
    getLessonsByUnit: async (req, res) => {
        try {
            const pool = getPool();
            const [lessons] = await pool.query(
                'SELECT * FROM Lessons WHERE unit_id = ? ORDER BY order_number',
                [req.params.unitId]
            );
            res.json(lessons);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get lesson by ID
    getLessonById: async (req, res) => {
        try {
            const pool = getPool();
            const [lessons] = await pool.query(
                `SELECT l.*, 
                (SELECT lesson_id FROM Lessons 
                 WHERE unit_id = l.unit_id 
                 AND order_number > l.order_number 
                 ORDER BY order_number ASC LIMIT 1) as next_lesson_id
                FROM Lessons l 
                WHERE l.lesson_id = ?`,
                [req.params.id]
            );

            if (lessons.length === 0) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json(lessons[0]);
        } catch (error) {
            console.error('Error fetching lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new lesson
    createLesson: async (req, res) => {
        try {
            const pool = getPool();
            const {
                title,
                description,
                order_number,
                grammar_focus,
                vocabulary_words,
                vocabulary_phrases,
                unit_id
            } = req.body;

            // Convert grammar_focus to JSON string if it's an array or object
            const grammar_focus_json = JSON.stringify(grammar_focus);

            const query = `
                INSERT INTO Lessons SET
                title = ?,
                description = ?,
                order_number = ?,
                grammar_focus = ?, 
                vocabulary_words = ?,
                vocabulary_phrases = ?,
                unit_id = ?
            `;

            const values = [
                title,
                description,
                order_number,
                grammar_focus_json,
                vocabulary_words,
                vocabulary_phrases,
                unit_id
            ];

            const [result] = await pool.query(query, values);

            // Initialize lesson status
            await pool.query(`
                INSERT INTO LessonStatus (lesson_id, unit_id, status)
                SELECT ?, ?, 
                    CASE 
                        WHEN NOT EXISTS (
                            SELECT 1 FROM Lessons 
                            WHERE unit_id = ? AND order_number < ?
                        ) THEN 'active'
                        ELSE 'locked'
                    END
            `, [result.insertId, unit_id, unit_id, order_number]);

            res.status(201).json({
                message: 'Lesson created successfully',
                lesson_id: result.insertId
            });
        } catch (error) {
            console.error('Error creating lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update lesson
    updateLesson: async (req, res) => {
        const { title, description, order_number } = req.body;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                'UPDATE Lessons SET title = ?, description = ?, order_number = ? WHERE lesson_id = ?',
                [title, description, order_number, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json({ message: 'Lesson updated successfully' });
        } catch (error) {
            console.error('Error updating lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete lesson
    deleteLesson: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM Lessons WHERE lesson_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json({ message: 'Lesson deleted successfully' });
        } catch (error) {
            console.error('Error deleting lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get all lessons for a specific unit with status
    getLessonsByUnitWithStatus: async (req, res) => {
        const { unitId } = req.params;
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            const pool = getPool();
            // Initialize lesson statuses if needed
            await initializeLessonStatuses(unitId, userId, pool);

            // Get lessons with user-specific status
            const [lessons] = await pool.query(
                `SELECT 
                    l.*,
                    COALESCE(ls.status, 'locked') as status,
                    ls.unlock_date,
                    ls.completion_date
                FROM Lessons l
                LEFT JOIN LessonStatus ls ON l.lesson_id = ls.lesson_id AND ls.user_id = ?
                WHERE l.unit_id = ?
                ORDER BY l.order_number ASC`,
                [userId, unitId]
            );

            res.json(lessons);
        } catch (error) {
            console.error('Error fetching lessons with status:', error);
            res.status(500).json({ error: 'Failed to fetch lessons' });
        }
    },

    // Update lesson status
    updateLessonStatus: async (req, res) => {
        const { lessonId } = req.params;
        const { status, userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            const pool = getPool();

            await pool.query(
                `UPDATE LessonStatus 
                 SET status = ?,
                 completion_date = CASE 
                    WHEN ? = 'completed' THEN CURRENT_TIMESTAMP 
                    ELSE completion_date 
                 END
                 WHERE lesson_id = ? AND user_id = ?`,
                [status, status, lessonId, userId]
            );

            if (status === 'completed') {
                const nextLessonId = await unlockNextLesson(lessonId, userId, pool);

                const [lessonStatuses] = await pool.query(
                    `SELECT l.lesson_id, l.title, ls.status 
                     FROM Lessons l 
                     LEFT JOIN LessonStatus ls ON l.lesson_id = ls.lesson_id AND ls.user_id = ?
                     WHERE l.lesson_id IN (?, ?)`,
                    [userId, lessonId, nextLessonId]
                );

                return res.json(lessonStatuses);
            }

            res.json({ message: 'Lesson status updated successfully' });
        } catch (error) {
            console.error('Error updating lesson status:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Add this new method to lessonController
    createMultipleLessons: async (req, res) => {
        const pool = getPool();
        const lessons = req.body; // This will be the array of lessons

        try {
            // Start a transaction
            await pool.query('START TRANSACTION');

            const createdLessons = [];
            
            for (const lesson of lessons) {
                const {
                    title,
                    description,
                    order_number,
                    grammar_focus,
                    vocabulary_words,
                    vocabulary_phrases,
                    unit_id
                } = lesson;

                // Convert grammar_focus to JSON string
                const grammar_focus_json = JSON.stringify(grammar_focus);

                const query = `
                    INSERT INTO Lessons SET
                    title = ?,
                    description = ?,
                    order_number = ?,
                    grammar_focus = ?, 
                    vocabulary_words = ?,
                    vocabulary_phrases = ?,
                    unit_id = ?
                `;

                const values = [
                    title,
                    description,
                    order_number,
                    grammar_focus_json,
                    vocabulary_words,
                    vocabulary_phrases,
                    unit_id
                ];

                const [result] = await pool.query(query, values);
                createdLessons.push({
                    lesson_id: result.insertId,
                    ...lesson
                });

                // Initialize lesson status
                await pool.query(`
                    INSERT INTO LessonStatus (lesson_id, unit_id, status)
                    SELECT ?, ?, 
                        CASE 
                            WHEN NOT EXISTS (
                                SELECT 1 FROM Lessons 
                                WHERE unit_id = ? AND order_number < ?
                            ) THEN 'active'
                            ELSE 'locked'
                        END
                `, [result.insertId, unit_id, unit_id, order_number]);
            }

            // Commit the transaction
            await pool.query('COMMIT');

            res.status(201).json({
                message: 'Lessons created successfully',
                lessons: createdLessons
            });

        } catch (error) {
            // Rollback in case of error
            await pool.query('ROLLBACK');
            console.error('Error creating multiple lessons:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = lessonController; 
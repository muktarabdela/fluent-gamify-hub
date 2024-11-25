const { getPool } = require('../config/db');

const lessonController = {
    // Get all lessons for a specific unit
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
            const [lesson] = await pool.query(
                'SELECT * FROM Lessons WHERE lesson_id = ?',
                [req.params.id]
            );

            if (lesson.length === 0) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json(lesson[0]);
        } catch (error) {
            console.error('Error fetching lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new lesson
    createLesson: async (req, res) => {
        console.log('Received request to create lesson:', req.body);
        const {
            unit_id,
            title,
            description,
            order_number,
            grammar_focus,
            vocabulary_words,
            vocabulary_phrases,
            status,
            live_session_title,
            live_session_duration,
            live_session_max_participants
        } = req.body;

        // Validate required fields
        if (!unit_id || !title || !order_number) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'unit_id, title, and order_number are required'
            });
        }

        try {
            const pool = getPool();
            
            // Verify that the unit exists
            const [unit] = await pool.query(
                'SELECT * FROM Units WHERE unit_id = ?',
                [unit_id]
            );

            if (unit.length === 0) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            // Create the lesson
            const [result] = await pool.query(
                `INSERT INTO Lessons (
                    unit_id, title, description, order_number, 
                    grammar_focus, vocabulary_words, vocabulary_phrases,
                    status, live_session_title, live_session_duration, 
                    live_session_max_participants
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    unit_id, title, description, order_number,
                    JSON.stringify(grammar_focus), vocabulary_words, vocabulary_phrases,
                    status || 'locked', live_session_title, live_session_duration,
                    live_session_max_participants
                ]
            );

            // Fetch the created lesson
            const [newLesson] = await pool.query(
                'SELECT * FROM Lessons WHERE lesson_id = ?',
                [result.insertId]
            );

            console.log('Created lesson:', newLesson[0]);
            res.status(201).json(newLesson[0]);
        } catch (error) {
            console.error('Error creating lesson:', error);
            res.status(500).json({
                message: 'Failed to create lesson',
                error: error.message
            });
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
        try {
            const pool = getPool();
            console.log('Fetching lessons for unit:', req.params.unitId);
            
            const [lessons] = await pool.query(`
                SELECT 
                    l.*,
                    CASE 
                        WHEN up.status = 'completed' THEN 'completed'
                        WHEN up.status = 'started' THEN 'active'
                        ELSE 'locked'
                    END as status
                FROM Lessons l
                LEFT JOIN UserProgress up ON l.lesson_id = up.lesson_id
                WHERE l.unit_id = ?
                ORDER BY l.order_number
            `, [req.params.unitId]);
            
            console.log('Found lessons:', lessons);
            res.json(lessons);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = lessonController; 
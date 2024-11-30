const { getPool } = require('../config/db');

const quickLessonController = {
    getQuickLessonByLessonId: async (req, res) => {
        try {
            const pool = getPool();
            const [quickLesson] = await pool.query(
                'SELECT * FROM QuickLessons WHERE lesson_id = ?',
                [req.params.lessonId]
            );
            
            if (quickLesson.length === 0) {
                return res.status(404).json({ message: 'Quick lesson not found' });
            }

            // Safely parse JSON fields
            try {
                quickLesson[0].key_points = JSON.parse(quickLesson[0].key_points);
            } catch (parseError) {
                console.error('Error parsing key_points:', parseError);
                quickLesson[0].key_points = [];
            }

            try {
                quickLesson[0].example_sentences = JSON.parse(quickLesson[0].example_sentences);
            } catch (parseError) {
                console.error('Error parsing example_sentences:', parseError);
                quickLesson[0].example_sentences = [];
            }
            
            res.json(quickLesson[0]);
        } catch (error) {
            console.error('Error fetching quick lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    createQuickLesson: async (req, res) => {
        console.log('Received request to create quick lesson:', req.body);
        const {
            lesson_id,
            title,
            introduction,
            grammar_focus,
            vocabulary_words,
            vocabulary_phrases,
            key_points,
            example_sentences,
            image_url
        } = req.body;

        // Validate required fields
        if (!lesson_id || !title || !introduction) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'lesson_id, title, and introduction are required'
            });
        }

        try {
            const pool = getPool();
            
            // Verify that the lesson exists
            const [lesson] = await pool.query(
                'SELECT * FROM Lessons WHERE lesson_id = ?',
                [lesson_id]
            );

            if (lesson.length === 0) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            // Create the quick lesson
            const [result] = await pool.query(
                `INSERT INTO QuickLessons (
                    lesson_id, title, introduction, grammar_focus,
                    vocabulary_words, vocabulary_phrases, key_points,
                    example_sentences, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    lesson_id,
                    title,
                    introduction,
                    JSON.stringify(grammar_focus || []),
                    JSON.stringify(vocabulary_words || []),
                    JSON.stringify(vocabulary_phrases || []),
                    JSON.stringify(key_points || []),
                    JSON.stringify(example_sentences || []),
                    image_url
                ]
            );

            // Fetch the created quick lesson
            const [newQuickLesson] = await pool.query(
                'SELECT * FROM QuickLessons WHERE quick_lesson_id = ?',
                [result.insertId]
            );

            // Parse JSON fields
            newQuickLesson[0].key_points = JSON.parse(newQuickLesson[0].key_points);
            newQuickLesson[0].example_sentences = JSON.parse(newQuickLesson[0].example_sentences);

            console.log('Created quick lesson:', newQuickLesson[0]);
            res.status(201).json(newQuickLesson[0]);
        } catch (error) {
            console.error('Error creating quick lesson:', error);
            res.status(500).json({
                message: 'Failed to create quick lesson',
                error: error.message
            });
        }
    },

    updateQuickLesson: async (req, res) => {
        const {
            title,
            content,
            key_points,
            example_sentences,
            image_url
        } = req.body;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                `UPDATE QuickLessons SET 
                title = ?, content = ?, key_points = ?,
                example_sentences = ?, image_url = ?
                WHERE quick_lesson_id = ?`,
                [
                    title,
                    content,
                    JSON.stringify(key_points || []),
                    JSON.stringify(example_sentences || []),
                    image_url,
                    req.params.id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Quick lesson not found' });
            }

            // Fetch updated quick lesson
            const [updatedQuickLesson] = await pool.query(
                'SELECT * FROM QuickLessons WHERE quick_lesson_id = ?',
                [req.params.id]
            );

            // Parse JSON fields
            updatedQuickLesson[0].key_points = JSON.parse(updatedQuickLesson[0].key_points);
            updatedQuickLesson[0].example_sentences = JSON.parse(updatedQuickLesson[0].example_sentences);

            res.json(updatedQuickLesson[0]);
        } catch (error) {
            console.error('Error updating quick lesson:', error);
            res.status(500).json({ message: error.message });
        }
    },

    deleteQuickLesson: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM QuickLessons WHERE quick_lesson_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Quick lesson not found' });
            }

            res.json({ message: 'Quick lesson deleted successfully' });
        } catch (error) {
            console.error('Error deleting quick lesson:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = quickLessonController; 
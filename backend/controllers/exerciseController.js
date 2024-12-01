const { getPool } = require('../config/db');

const exerciseController = {
    // Get exercises by lesson
    getExercisesByLesson: async (req, res) => {
        try {
            const pool = getPool();
            const [exercises] = await pool.query(
                'SELECT * FROM Exercises WHERE lesson_id = ? ORDER BY order_number',
                [req.params.lessonId]
            );
            res.json(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get exercise by ID
    getExerciseById: async (req, res) => {
        try {
            const pool = getPool();
            const [exercise] = await pool.query(
                'SELECT * FROM Exercises WHERE exercise_id = ?',
                [req.params.id]
            );

            if (exercise.length === 0) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.json(exercise[0]);
        } catch (error) {
            console.error('Error fetching exercise:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new exercise
    createExercise: async (req, res) => {
        console.log('Received request to create exercise:', req.body);
        const {
            lesson_id,
            type,
            question,
            correct_answer,
            options,
            audio_url,
            image_url,
            order_number
        } = req.body;

        // Validate required fields
        if (!lesson_id || !type || !question || !correct_answer || !order_number) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'lesson_id, type, question, correct_answer, and order_number are required'
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

            // Create the exercise
            const [result] = await pool.query(
                `INSERT INTO Exercises (
                    lesson_id, type, question, correct_answer,
                    options, audio_url, image_url, order_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    lesson_id, type, question, correct_answer,
                    JSON.stringify(options), audio_url, image_url, order_number
                ]
            );

            // Fetch the created exercise
            const [newExercise] = await pool.query(
                'SELECT * FROM Exercises WHERE exercise_id = ?',
                [result.insertId]
            );

            // console.log('Created exercise:', newExercise[0]);
            res.status(201).json(newExercise[0]);
        } catch (error) {
            console.error('Error creating exercise:', error);
            res.status(500).json({
                message: 'Failed to create exercise',
                error: error.message
            });
        }
    },

    // Update exercise
    updateExercise: async (req, res) => {
        const {
            type,
            question,
            correct_answer,
            options,
            audio_url,
            image_url,
            order_number
        } = req.body;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                `UPDATE Exercises SET 
                type = ?, question = ?, correct_answer = ?,
                options = ?, audio_url = ?, image_url = ?,
                order_number = ? WHERE exercise_id = ?`,
                [type, question, correct_answer, JSON.stringify(options),
                 audio_url, image_url, order_number, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.json({ message: 'Exercise updated successfully' });
        } catch (error) {
            console.error('Error updating exercise:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete exercise
    deleteExercise: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM Exercises WHERE exercise_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.json({ message: 'Exercise deleted successfully' });
        } catch (error) {
            console.error('Error deleting exercise:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get exercises by lesson with user progress
    getExercisesByLessonWithProgress: async (req, res) => {
        try {
            const pool = getPool();
            const userId = req.query.userId;
            // console.log('Fetching exercises for lesson:', req.params.lessonId, 'and user:', userId);
            
            const [exercises] = await pool.query(`
                SELECT 
                    e.*,
                    COALESCE(up.score, 0) as user_score,
                    CASE 
                        WHEN up.status = 'completed' THEN 'completed'
                        WHEN up.status = 'started' THEN 'in_progress'
                        ELSE 'not_started'
                    END as progress_status
                FROM Exercises e
                LEFT JOIN UserProgress up ON e.exercise_id = up.exercise_id 
                    AND up.user_id = ?
                WHERE e.lesson_id = ?
                ORDER BY e.order_number
            `, [userId, req.params.lessonId]);
            
            // console.log('Found exercises:', exercises);
            res.json(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Submit exercise answer
    submitExerciseAnswer: async (req, res) => {
        try {
            const { id: exerciseId } = req.params;
            const { userId, answer } = req.body;

            if (!userId || !answer) {
                return res.status(400).json({ message: 'userId and answer are required' });
            }

            const pool = getPool();
            
            // Get the exercise
            const [exercise] = await pool.query(
                'SELECT * FROM Exercises WHERE exercise_id = ?',
                [exerciseId]
            );

            if (exercise.length === 0) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            // Validate answer based on exercise type
            let score = 0;
            let isCorrect = false;

            switch (exercise[0].type) {
                case 'sentence_building':
                case 'fill_blank':
                    isCorrect = answer.toLowerCase().trim() === exercise[0].correct_answer.toLowerCase().trim();
                    break;
                case 'multiple_choice':
                    isCorrect = answer === exercise[0].correct_answer;
                    break;
                case 'shadowing':
                    // For shadowing exercises, we assume completion equals success
                    isCorrect = true;
                    break;
            }

            score = isCorrect ? 100 : 0;

            // Update or insert progress
            await pool.query(`
                INSERT INTO UserProgress (user_id, lesson_id, exercise_id, status, score)
                VALUES (?, ?, ?, 'completed', ?)
                ON DUPLICATE KEY UPDATE
                status = 'completed',
                score = ?,
                updated_at = CURRENT_TIMESTAMP
            `, [userId, exercise[0].lesson_id, exerciseId, score, score]);

            res.json({
                isCorrect,
                score,
                correctAnswer: exercise[0].correct_answer
            });
        } catch (error) {
            console.error('Error submitting exercise answer:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = exerciseController; 
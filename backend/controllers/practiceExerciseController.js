const { getPool } = require('../config/db');

const practiceExerciseController = {
    getTopics: async (req, res) => {
        try {
            const pool = getPool();
            const [topics] = await pool.query('SELECT * FROM Topics');
            res.json(topics);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getCategories: async (req, res) => {
        try {
            const pool = getPool();
            const [categories] = await pool.query(`
                SELECT 
                    c.*,
                    COALESCE(JSON_ARRAYAGG(
                        CASE WHEN et.id IS NOT NULL
                        THEN JSON_OBJECT(
                            'id', et.id,
                            'name', et.name,
                            'category_id', et.category_id
                        )
                        ELSE NULL END
                    ), '[]') as exerciseTypes
                FROM Categories c
                LEFT JOIN ExerciseTypes et ON c.id = et.category_id
                GROUP BY c.id
            `);

            res.json(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ message: error.message });
        }
    },
    createExercise: async (req, res) => {
        try {
            const pool = getPool();
            const { typeId, topicId, content } = req.body;
            // Validate required fields
            if (!typeId || !topicId || !content) {
                return res.status(400).json({
                    message: 'typeId, topicId and content are required'
                });
            }


            // Validate content is an object
            if (typeof content !== 'object' || content === null) {
                return res.status(400).json({
                    message: 'Content must be a valid object'
                });
            }

            const [result] = await pool.query(
                `INSERT INTO PracticeExercises (type_id, topic_id, content)
                VALUES (?, ?, ?, ?)`,
                [typeId, topicId, JSON.stringify(content)]
            );

            res.status(201).json({
                id: result.insertId,
                message: 'Exercise created successfully'
            });
        } catch (error) {
            console.error('Error creating exercise:', error);
            res.status(500).json({ error: 'Failed to create exercise' });
        }
    },
    getExercises: async (req, res) => {
        try {
            const pool = getPool();
            const { categoryId, topicId } = req.query;
            console.log(categoryId, topicId)
            if (!categoryId || !topicId) {
                return res.status(400).json({
                    message: 'categoryId, and topicId are required query parameters'
                });
            }

            // Validate query parameters if provided
            // if (categoryId && !Number.isInteger(Number(categoryId))) {
            //     return res.status(400).json({
            //         message: 'Category ID must be a valid integer'
            //     });
            // }

            if (topicId && !Number.isInteger(Number(topicId))) {
                return res.status(400).json({
                    message: 'Topic ID must be a valid integer'
                });
            }

            // Build dynamic query based on filters
            let query = `
                SELECT e.*, et.name AS type_name, t.name AS topic_name, c.name AS category_name 
                FROM PracticeExercises e
                JOIN ExerciseTypes et ON e.type_id = et.id
                JOIN Topics t ON e.topic_id = t.id
                JOIN Categories c ON et.category_id = c.id
                WHERE 1=1
            `;
            const params = [];

            if (categoryId) {
                query += ` AND c.id = ?`;
                params.push(categoryId);
            }
            if (topicId) {
                query += ` AND t.id = ?`;
                params.push(topicId);
            }

            const [exercises] = await pool.query(query, params);
            res.json(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            res.status(500).json({ message: 'Failed to fetch exercises' });
        }
    },
    getExerciseById: async (req, res) => {
        try {
            const pool = getPool();

            const { id } = req.params;
            console.log("id from getExerciseById controller", id)
            if (!Number.isInteger(Number(id))) {
                return res.status(400).json({
                    message: 'Exercise ID must be a valid integer'
                });
            }

            const query = `
                SELECT e.*, et.name AS type_name, t.name AS topic_name, c.name AS category_name 
                FROM PracticeExercises e
                JOIN ExerciseTypes et ON e.type_id = et.id
                JOIN Topics t ON e.topic_id = t.id
                JOIN Categories c ON et.category_id = c.id
                WHERE e.id = ?
            `;

            const [exercise] = await pool.query(query, [id]);

            if (exercise.length === 0) {
                return res.status(404).json({
                    message: 'Exercise not found'
                });
            }

            res.json(exercise[0]);
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            res.status(500).json({ message: 'Failed to fetch exercise details' });
        }
    },
    // ########################################################
};

module.exports = practiceExerciseController; 
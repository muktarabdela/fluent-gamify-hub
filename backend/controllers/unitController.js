const { getPool } = require('../config/db');

const unitController = {
    // Get all units with lesson counts and progress
    getAllUnits: async (req, res) => {
        try {
            const pool = getPool();
            const [units] = await pool.query(`
                SELECT 
                    u.*,
                    COUNT(l.lesson_id) as total_lessons,
                    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_lessons,
                    IFNULL(ROUND((COUNT(CASE WHEN up.status = 'completed' THEN 1 END) / COUNT(l.lesson_id)) * 100, 2), 0) as progress_percentage
                FROM Units u
                LEFT JOIN Lessons l ON u.unit_id = l.unit_id
                LEFT JOIN UserProgress up ON l.lesson_id = up.lesson_id
                GROUP BY u.unit_id
                ORDER BY u.order_number
            `);
            res.json(units);
        } catch (error) {
            console.error('Error fetching units:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get unit by ID
    getUnitById: async (req, res) => {
        try {
            const pool = getPool();
            const [unit] = await pool.query(
                'SELECT * FROM Units WHERE unit_id = ?',
                [req.params.id]
            );

            if (unit.length === 0) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json(unit[0]);
        } catch (error) {
            console.error('Error fetching unit:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new unit
    createUnit: async (req, res) => {
        console.log('Received request to create unit:', req.body);
        const { 
            title, 
            description, 
            order_number,
            total_lessons,
            completed_lessons,
            progress_percentage,
            is_active 
        } = req.body;

        // Validate required fields
        if (!title || !order_number) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Title and order_number are required'
            });
        }

        try {
            const pool = getPool();
            const [result] = await pool.query(
                `INSERT INTO Units (
                    title, 
                    description, 
                    order_number, 
                    total_lessons, 
                    completed_lessons, 
                    progress_percentage,
                    is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    title, 
                    description, 
                    order_number,
                    total_lessons || 0,
                    completed_lessons || 0,
                    progress_percentage || 0.00,
                    is_active !== undefined ? is_active : true
                ]
            );

            console.log('Unit created successfully:', result);

            // Fetch the created unit
            const [newUnit] = await pool.query(
                'SELECT * FROM Units WHERE unit_id = ?',
                [result.insertId]
            );

            console.log('Created unit:', newUnit[0]);
            res.status(201).json(newUnit[0]);
        } catch (error) {
            console.error('Error creating unit:', error);
            res.status(500).json({
                message: 'Failed to create unit',
                error: error.message
            });
        }
    },

    // Update unit
    updateUnit: async (req, res) => {
        const { title, description, order_number } = req.body;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                'UPDATE Units SET title = ?, description = ?, order_number = ? WHERE unit_id = ?',
                [title, description, order_number, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json({ message: 'Unit updated successfully' });
        } catch (error) {
            console.error('Error updating unit:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete unit
    deleteUnit: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM Units WHERE unit_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Unit not found' });
            }

            res.json({ message: 'Unit deleted successfully' });
        } catch (error) {
            console.error('Error deleting unit:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update unit progress
    updateUnitProgress: async (req, res) => {
        const { unitId } = req.params;
        try {
            const pool = getPool();
            
            // Get total and completed lessons
            const [progress] = await pool.query(`
                SELECT 
                    COUNT(l.lesson_id) as total_lessons,
                    COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_lessons
                FROM Units u
                LEFT JOIN Lessons l ON u.unit_id = l.unit_id
                LEFT JOIN UserProgress up ON l.lesson_id = up.lesson_id
                WHERE u.unit_id = ?
                GROUP BY u.unit_id
            `, [unitId]);

            if (progress.length > 0) {
                const { total_lessons, completed_lessons } = progress[0];
                const progress_percentage = total_lessons > 0 
                    ? (completed_lessons / total_lessons) * 100 
                    : 0;

                // Update unit with new progress
                await pool.query(`
                    UPDATE Units 
                    SET 
                        total_lessons = ?,
                        completed_lessons = ?,
                        progress_percentage = ?
                    WHERE unit_id = ?
                `, [total_lessons, completed_lessons, progress_percentage, unitId]);

                res.json({ 
                    total_lessons, 
                    completed_lessons, 
                    progress_percentage 
                });
            } else {
                res.status(404).json({ message: 'Unit not found' });
            }
        } catch (error) {
            console.error('Error updating unit progress:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = unitController; 
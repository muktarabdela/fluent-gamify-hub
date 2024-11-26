const { getPool } = require('../config/db');

const userController = {
    // Create or update user from Telegram data
    createOrUpdateUser: async (req, res) => {
        const {
            id,
            username,
            first_name,
            last_name,
            photo_url,
            auth_date
        } = req.body;

        if (!id) {
            return res.status(400).json({
                message: 'User ID is required'
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
                const [result] = await pool.query(
                    `INSERT INTO Users (
                        user_id, username, first_name, last_name, 
                        photo_url, auth_date
                    ) VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?))`,
                    [id, username, first_name, last_name, photo_url, auth_date]
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
                        photo_url = ?,
                        auth_date = FROM_UNIXTIME(?),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?`,
                    [username, first_name, last_name, photo_url, auth_date, id]
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

        try {
            const pool = getPool();
            const [result] = await pool.query(
                'UPDATE Users SET preferences = ? WHERE user_id = ?',
                [JSON.stringify(preferences), req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User preferences updated successfully' });
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
    }
};

module.exports = userController; 
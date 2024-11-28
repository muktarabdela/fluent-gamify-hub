const { getPool } = require('../config/db');

const telegramGroupController = {
    // Get all telegram groups
    getAllGroups: async (req, res) => {
        try {
            const pool = getPool();
            const [groups] = await pool.query('SELECT * FROM TelegramGroups ORDER BY created_at DESC');
            res.json(groups);
        } catch (error) {
            console.error('Error fetching telegram groups:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get an available telegram group
    getAvailableGroup: async (req, res) => {
        try {
            const pool = getPool();
            const [group] = await pool.query(
                'SELECT * FROM TelegramGroups WHERE status = "available" ORDER BY last_used_at ASC LIMIT 1'
            );

            if (group.length === 0) {
                return res.status(404).json({ message: 'No available groups found' });
            }

            res.json(group[0]);
        } catch (error) {
            console.error('Error fetching available group:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get telegram group by ID
    getGroupById: async (req, res) => {
        try {
            const pool = getPool();
            const [group] = await pool.query(
                'SELECT * FROM TelegramGroups WHERE group_id = ?',
                [req.params.id]
            );

            if (group.length === 0) {
                return res.status(404).json({ message: 'Telegram group not found' });
            }

            res.json(group[0]);
        } catch (error) {
            console.error('Error fetching telegram group:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new telegram group
    createGroup: async (req, res) => {
        const { telegram_chat_id, status } = req.body;

        if (!telegram_chat_id) {
            return res.status(400).json({
                message: 'telegram_chat_id is required'
            });
        }

        try {
            const pool = getPool();
            const [result] = await pool.query(
                'INSERT INTO TelegramGroups (telegram_chat_id, status) VALUES (?, ?)',
                [telegram_chat_id, status || 'available']
            );

            const [newGroup] = await pool.query(
                'SELECT * FROM TelegramGroups WHERE group_id = ?',
                [result.insertId]
            );

            res.status(201).json(newGroup[0]);
        } catch (error) {
            console.error('Error creating telegram group:', error);
            res.status(500).json({
                message: 'Failed to create telegram group',
                error: error.message
            });
        }
    },

    // Update telegram group
    updateGroup: async (req, res) => {
        const { telegram_chat_id, status } = req.body;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                'UPDATE TelegramGroups SET telegram_chat_id = ?, status = ?, last_used_at = CASE WHEN status = "in_use" THEN CURRENT_TIMESTAMP ELSE last_used_at END WHERE group_id = ?',
                [telegram_chat_id, status, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Telegram group not found' });
            }

            res.json({ message: 'Telegram group updated successfully' });
        } catch (error) {
            console.error('Error updating telegram group:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete telegram group
    deleteGroup: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM TelegramGroups WHERE group_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Telegram group not found' });
            }

            res.json({ message: 'Telegram group deleted successfully' });
        } catch (error) {
            console.error('Error deleting telegram group:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = telegramGroupController; 
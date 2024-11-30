const { getPool } = require('../config/db');
const axios = require('axios');

// Get bot API URL from environment
const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';

const botController = {
    // Create new session
    createNewSession: async (req, res) => {
        try {
            const { topic, group_id } = req.body;
            console.log("telegram_chat_id", group_id);

            const pool = getPool();
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // First check if the group exists in TelegramGroups
                const [existingGroup] = await connection.query(
                    'SELECT group_id FROM TelegramGroups WHERE telegram_chat_id = ?',
                    [group_id.toString()]
                );

                let groupId;
                if (existingGroup.length === 0) {
                    // Create new TelegramGroup if it doesn't exist
                    const [newGroup] = await connection.query(
                        'INSERT INTO TelegramGroups (telegram_chat_id, status) VALUES (?, "in_use")',
                        [group_id.toString()]
                    );
                    groupId = newGroup.insertId;
                } else {
                    groupId = existingGroup[0].group_id;
                    // Update existing group status to in_use
                    await connection.query(
                        `UPDATE TelegramGroups 
                        SET status = 'in_use',
                            last_used_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE group_id = ?`,
                        [groupId]
                    );
                }

                // Create bot session and get invite link
                const response = await axios.post(`${BOT_API_URL}/newsession`, {
                    topic,
                    group_id
                }, {
                    timeout: 15000
                });

                await connection.commit();

                res.json({
                    success: true,
                    inviteLink: response.data.inviteLink,
                    notificationSent: response.data.notificationSent,
                    groupId
                });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error creating session:', error);
            const errorMessage = error.code === 'ECONNABORTED'
                ? 'Request timed out. Please try again.'
                : error.response?.data?.message || 'Failed to create session';

            res.status(error.response?.status || 500).json({
                success: false,
                message: errorMessage,
            });
        }
    },

    // End session
    endSession: async (req, res) => {
        try {
            const { group_id } = req.body;

            if (!group_id) {
                return res.status(400).json({
                    success: false,
                    message: 'group_id is required'
                });
            }

            const pool = getPool();
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // First get the group_id from TelegramGroups using telegram_chat_id
                const [telegramGroup] = await connection.query(
                    'SELECT group_id FROM TelegramGroups WHERE telegram_chat_id = ?',
                    [group_id.toString()]
                );

                if (telegramGroup.length === 0) {
                    throw new Error('Telegram group not found');
                }

                const internalGroupId = telegramGroup[0].group_id;

                // Update LiveSessions table
                const [liveSessionResult] = await connection.query(
                    `UPDATE LiveSessions 
                    SET status = 'Scheduled', 
                        updated_at = CURRENT_TIMESTAMP 
                    WHERE telegram_chat_id = ? 
                    AND status != 'Ended'`,
                    [group_id.toString()]
                );

                // Update TelegramGroups table
                const [telegramGroupResult] = await connection.query(
                    `UPDATE TelegramGroups 
                    SET status = 'available', 
                        updated_at = CURRENT_TIMESTAMP,
                        last_used_at = CURRENT_TIMESTAMP 
                    WHERE telegram_chat_id = ?`,
                    [group_id.toString()]
                );

                await connection.commit();

                res.json({
                    success: true,
                    message: 'Session ended successfully',
                    liveSessionsUpdated: liveSessionResult.affectedRows,
                    telegramGroupsUpdated: telegramGroupResult.affectedRows
                });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error ending session:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to end session'
            });
        }
    }
};

module.exports = botController;

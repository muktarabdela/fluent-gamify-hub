const { getPool } = require('../config/db');
const axios = require('axios');

// Get bot API URL from environment
const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';

const botController = {
    // Create new session
    createNewSession: async (req, res) => {
        const { topic, group_id } = req.body;
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Parallel database operations
            const [existingGroupQuery, groupStatusUpdate] = await Promise.all([
                connection.query(
                    'SELECT group_id FROM TelegramGroups WHERE telegram_chat_id = ?',
                    [group_id.toString()]
                ),
                connection.query(
                    `UPDATE TelegramGroups 
                    SET status = 'in_use',
                        last_used_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE telegram_chat_id = ?`,
                    [group_id.toString()]
                )
            ]);

            let groupId;
            if (existingGroupQuery[0].length === 0) {
                const [newGroup] = await connection.query(
                    'INSERT INTO TelegramGroups (telegram_chat_id, status) VALUES (?, "in_use")',
                    [group_id.toString()]
                );
                groupId = newGroup.insertId;
            } else {
                groupId = existingGroupQuery[0][0].group_id;
            }

            // Create bot session
            const response = await axios.post(`${BOT_API_URL}/newsession`, {
                topic,
                group_id
            }, {
                timeout: 30000
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
    },

    // End session
    endSession: async (req, res) => {
        try {
            const { group_id, userId } = req.body;

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

                // Get the session ID from LiveSessions
                const [liveSession] = await connection.query(
                    `SELECT session_id FROM LiveSessions 
                    WHERE telegram_chat_id = ? 
                    AND status != 'Ended' 
                    ORDER BY created_at DESC 
                    LIMIT 1`,
                    [group_id.toString()]
                );

                if (liveSession.length === 0) {
                    throw new Error('Active session not found');
                }

                const sessionId = liveSession[0].session_id;

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

                // Update participant status
                const [participantResult] = await connection.query(
                    `UPDATE LiveSessionParticipants 
                    SET status = 'completed',
                        completed_at = CURRENT_TIMESTAMP
                    WHERE session_id = ? 
                    AND user_id = ?`,
                    [sessionId, userId]
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

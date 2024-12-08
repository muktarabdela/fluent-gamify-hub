const { getPool } = require('../config/db');

const liveSessionController = {
    // Get all live sessions with filters
    getAllSessions: async (req, res) => {
        try {
            const pool = getPool();
            const { status, level } = req.query;

            let query = `
                SELECT ls.*, 
                       l.title as lesson_title,
                       u.username as host_username,
                       u.first_name as host_first_name
                FROM LiveSessions ls
                LEFT JOIN Lessons l ON ls.lesson_id = l.lesson_id
                LEFT JOIN Users u ON ls.host_user_id = u.user_id
                WHERE 1=1
            `;

            const params = [];

            if (status) {
                query += ` AND ls.status = ?`;
                params.push(status);
            }

            if (level) {
                query += ` AND ls.level = ?`;
                params.push(level);
            }

            query += ` ORDER BY ls.start_time ASC`;

            const [sessions] = await pool.query(query, params);
            res.json(sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get sessions by type (lesson or free_talk)
    getSessionsByType: async (req, res) => {
        try {
            const pool = getPool();
            const { sessionType } = req.params;
            const { status, userId } = req.query;

            let query = `
                SELECT 
                    ls.*,
                    l.title as lesson_title,
                    u.username as host_username,
                    u.first_name as host_first_name,
                    lsp.status as user_status
                FROM LiveSessions ls
                LEFT JOIN Lessons l ON ls.lesson_id = l.lesson_id
                LEFT JOIN Users u ON ls.host_user_id = u.user_id
                LEFT JOIN LiveSessionParticipants lsp ON ls.session_id = lsp.session_id AND lsp.user_id = ?
                WHERE ls.session_type = ?
            `;

            const params = [userId, sessionType];

            if (status) {
                query += ` AND ls.status = ?`;
                params.push(status);
            }

            query += ` ORDER BY ls.start_time ASC`;

            const [sessions] = await pool.query(query, params);
            res.json(sessions);
        } catch (error) {
            console.error('Error fetching sessions by type:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get session by ID
    getSessionById: async (req, res) => {
        try {
            const pool = getPool();
            const [session] = await pool.query(`
                SELECT ls.*, 
                       l.title as lesson_title,
                       u.username as host_username,
                       u.first_name as host_first_name
                FROM LiveSessions ls
                LEFT JOIN Lessons l ON ls.lesson_id = l.lesson_id
                LEFT JOIN Users u ON ls.host_user_id = u.user_id
                WHERE ls.session_id = ?
            `, [req.params.id]);

            if (session.length === 0) {
                return res.status(404).json({ message: 'Session not found' });
            }

            res.json(session[0]);
        } catch (error) {
            console.error('Error fetching session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create new session
    createSession: async (req, res) => {
        const {
            session_type,
            lesson_id,
            topic,
            level,
            start_time,
            duration,
            max_participants,
            host_user_id,
            description,
            about,
        } = req.body;

        if (!session_type || !topic || !level || !start_time ) {
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        try {
            const pool = getPool();

            // If it's a lesson session, verify the lesson exists
            if (session_type === 'lesson' && lesson_id) {
                const [lesson] = await pool.query(
                    'SELECT * FROM Lessons WHERE lesson_id = ?',
                    [lesson_id]
                );

                if (lesson.length === 0) {
                    return res.status(404).json({ message: 'Lesson not found' });
                }
            }

            const [result] = await pool.query(
                `INSERT INTO LiveSessions (
                    session_type, lesson_id, topic, level, 
                    start_time, duration, max_participants, 
                    host_user_id, status, description, about
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?)`,
                [
                    session_type, lesson_id, topic, level,
                    start_time, duration, max_participants,
                    host_user_id, description, about
                ]
            );

            const [newSession] = await pool.query(
                'SELECT * FROM LiveSessions WHERE session_id = ?',
                [result.insertId]
            );

            res.status(201).json(newSession[0]);
        } catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update session
    updateSession: async (req, res) => {
        const {
            topic,
            level,
            start_time,
            duration,
            max_participants,
            status
        } = req.body;

        try {
            const pool = getPool();
            const [result] = await pool.query(
                `UPDATE LiveSessions 
                SET topic = ?, level = ?, start_time = ?,
                duration = ?, max_participants = ?, status = ?
                WHERE session_id = ?`,
                [topic, level, start_time, duration, max_participants, status, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Session not found' });
            }

            res.json({ message: 'Session updated successfully' });
        } catch (error) {
            console.error('Error updating session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete session
    deleteSession: async (req, res) => {
        try {
            const pool = getPool();
            const [result] = await pool.query(
                'DELETE FROM LiveSessions WHERE session_id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Session not found' });
            }

            res.json({ message: 'Session deleted successfully' });
        } catch (error) {
            console.error('Error deleting session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Join session
    joinSession: async (req, res) => {
        const { userId } = req.body;
        const sessionId = req.params.id;

        try {
            const pool = getPool();
            const connection = await pool.getConnection();

            try {
                // Check if session exists and has space
                const [session] = await connection.query(
                    'SELECT * FROM LiveSessions WHERE session_id = ?',
                    [sessionId]
                );

                if (session.length === 0) {
                    throw new Error('Session not found');
                }

                if (session[0].current_participants >= session[0].max_participants) {
                    throw new Error('Session is full');
                }

                // Start transaction
                await connection.beginTransaction();

                // // Add participant
                // await connection.query(
                //     'INSERT INTO LiveSessionParticipants (session_id, user_id) VALUES (?, ?)',
                //     [sessionId, userId]
                // );

                // Update current participants count
                await connection.query(
                    'UPDATE LiveSessions SET current_participants = current_participants + 1 WHERE session_id = ?',
                    [sessionId]
                );

                await connection.commit();

                res.json({ message: 'Successfully joined session' });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('Error joining session:', error);
            res.status(error.message === 'Session not found' ? 404 :
                error.message === 'Session is full' ? 400 : 500)
                .json({ message: error.message });
        }
    },

    // Leave session
    leaveSession: async (req, res) => {
        const { userId } = req.body;
        const sessionId = req.params.id;

        try {
            const pool = getPool();

            await pool.query('START TRANSACTION');

            // Remove participant
            // const [result] = await pool.query(
            //     'UPDATE LiveSessionParticipants SET status = "Left" WHERE session_id = ? AND user_id = ?',
            //     [sessionId, userId]
            // );

            if (result.affectedRows > 0) {
                // Update current participants count
                await pool.query(
                    'UPDATE LiveSessions SET current_participants = current_participants - 1 WHERE session_id = ?',
                    [sessionId]
                );
            }

            await pool.query('COMMIT');

            res.json({ message: 'Successfully left session' });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error leaving session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get sessions by user
    getSessionsByUser: async (req, res) => {
        try {
            const pool = getPool();
            const [sessions] = await pool.query(`
                SELECT ls.*, 
l.title as lesson_title,
                       u.username as host_username,
                       u.first_name as host_first_name
                FROM LiveSessions ls
                LEFT JOIN Lessons l ON ls.lesson_id = l.lesson_id
                LEFT JOIN Users u ON ls.host_user_id = u.user_id
                LEFT JOIN LiveSessionParticipants lsp ON ls.session_id = lsp.session_id
                WHERE lsp.user_id = ? AND lsp.status = 'Joined'
                ORDER BY ls.start_time ASC
            `, [req.params.userId]);

            res.json(sessions);
        } catch (error) {
            console.error('Error fetching user sessions:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update telegram chat ID and status
    updateTelegramChatId: async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { telegram_chat_id } = req.body;
            console.log("telegram_chat_id", telegram_chat_id)
            const pool = getPool();
            const connection = await pool.getConnection();

            try {
                await connection.beginTransaction();
                // Update LiveSession with telegram_group_id and status
                const [updateResult] = await connection.query(
                    `UPDATE LiveSessions 
                     SET telegram_chat_id = ?,
                         status = 'Ongoing',
                         updated_at = CURRENT_TIMESTAMP
                     WHERE session_id = ?`,
                    [telegram_chat_id, sessionId]
                );

                if (updateResult.affectedRows === 0) {
                    throw new Error('Session not found');
                }

                await connection.commit();

                res.json({
                    success: true,
                    message: 'Session updated successfully',
                    telegram_chat_id,
                    sessionId
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('Error updating telegram chat ID:', error);
            res.status(error.message === 'Session not found' ? 404 : 500).json({
                success: false,
                message: error.message || 'Failed to update telegram chat ID'
            });
        }
    },

    // Add new method to handle session completion
    completeUserSession: async (req, res) => {
        const { sessionId } = req.params;
        const { userId } = req.body;

        try {
            const pool = getPool();
            const connection = await pool.getConnection();

            try {
                await connection.beginTransaction();

                // Update participant status
                // const [updateResult] = await connection.query(
                //     `UPDATE LiveSessionParticipants 
                //      SET status = 'joined',
                //          completed_at = CURRENT_TIMESTAMP
                //      WHERE session_id = ? AND user_id = ?`,
                //     [sessionId, userId]
                // );

                // if (updateResult.affectedRows === 0) {
                //     throw new Error('Participant record not found');
                // }

                await connection.commit();

                res.json({
                    success: true,
                    message: 'Session completed for user',
                    sessionId,
                    userId
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('Error completing session for user:', error);
            res.status(error.message === 'Participant record not found' ? 404 : 500).json({
                success: false,
                message: error.message || 'Failed to complete session for user'
            });
        }
    }
};

module.exports = liveSessionController; 
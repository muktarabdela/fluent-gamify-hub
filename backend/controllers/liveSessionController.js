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
            const { status } = req.query;

            let query = `
                SELECT ls.*, 
                       l.title as lesson_title,
                       u.username as host_username,
                       u.first_name as host_first_name
                FROM LiveSessions ls
                LEFT JOIN Lessons l ON ls.lesson_id = l.lesson_id
                LEFT JOIN Users u ON ls.host_user_id = u.user_id
                WHERE ls.session_type = ?
            `;

            const params = [sessionType];

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
            host_user_id
        } = req.body;

        if (!session_type || !topic || !level || !start_time || !duration) {
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
                    host_user_id, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled')`,
                [
                    session_type, lesson_id, topic, level,
                    start_time, duration, max_participants,
                    host_user_id
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

            // Check if session exists and has space
            const [session] = await pool.query(
                'SELECT * FROM LiveSessions WHERE session_id = ?',
                [sessionId]
            );

            if (session.length === 0) {
                return res.status(404).json({ message: 'Session not found' });
            }

            if (session[0].current_participants >= session[0].max_participants) {
                return res.status(400).json({ message: 'Session is full' });
            }

            // Start transaction
            await pool.query('START TRANSACTION');

            // Add participant
            await pool.query(
                'INSERT INTO LiveSessionParticipants (session_id, user_id) VALUES (?, ?)',
                [sessionId, userId]
            );

            // Update current participants count
            await pool.query(
                'UPDATE LiveSessions SET current_participants = current_participants + 1 WHERE session_id = ?',
                [sessionId]
            );

            await pool.query('COMMIT');

            res.json({ message: 'Successfully joined session' });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error joining session:', error);
            res.status(500).json({ message: error.message });
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
            const [result] = await pool.query(
                'UPDATE LiveSessionParticipants SET status = "Left" WHERE session_id = ? AND user_id = ?',
                [sessionId, userId]
            );

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
    }
};

module.exports = liveSessionController; 
const { LiveSession, User, Lesson, LiveSessionParticipant } = require('../model/model'); // Import Mongoose models

const liveSessionController = {
    // Get all live sessions with filters
    getAllSessions: async (req, res) => {
        try {
            const { status, level } = req.query;

            let query = {
                ...(status && { status }),
                ...(level && { level })
            };

            const sessions = await LiveSession.find(query)
                .populate('lesson_id', 'title')
                .populate('host_user_id', 'username first_name')
                .sort({ start_time: 1 });

            res.json(sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get sessions by type (lesson or free_talk)
    getSessionsByType: async (req, res) => {
        try {
            const { sessionType } = req.params;
            const { status, userId } = req.query;

            let query = {
                session_type: sessionType,
                ...(status && { status })
            };

            const sessions = await LiveSession.find(query)
                .populate('lesson_id', 'title')
                .populate('host_user_id', 'username first_name');

            res.json(sessions);
        } catch (error) {
            console.error('Error fetching sessions by type:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get session by ID
    getSessionById: async (req, res) => {
        try {
            const session = await LiveSession.findById(req.params.id)
                .populate('lesson_id', 'title')
                .populate('host_user_id', 'username first_name');

            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            res.json(session);
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

        if (!session_type || !topic || !level || !start_time) {
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        try {
            // If it's a lesson session, verify the lesson exists
            if (session_type === 'lesson' && lesson_id) {
                const lesson = await Lesson.findById(lesson_id);
                if (!lesson) {
                    return res.status(404).json({ message: 'Lesson not found' });
                }
            }

            const newSession = new LiveSession({
                session_type,
                lesson_id,
                topic,
                level,
                start_time,
                duration,
                max_participants,
                host_user_id,
                status: 'Scheduled',
                description,
                about
            });

            await newSession.save();
            res.status(201).json(newSession);
        } catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update session
    updateSession: async (req, res) => {
        const { topic, level, start_time, duration, max_participants, status } = req.body;

        try {
            const updatedSession = await LiveSession.findByIdAndUpdate(
                req.params.id,
                { topic, level, start_time, duration, max_participants, status },
                { new: true }
            );

            if (!updatedSession) {
                return res.status(404).json({ message: 'Session not found' });
            }

            res.json({ message: 'Session updated successfully', session: updatedSession });
        } catch (error) {
            console.error('Error updating session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delete session
    deleteSession: async (req, res) => {
        try {
            const deletedSession = await LiveSession.findByIdAndDelete(req.params.id);

            if (!deletedSession) {
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
            const participant = new LiveSessionParticipant({
                session_id: sessionId,
                user_id: userId,
                status: 'joined'
            });

            await participant.save();
            res.json({ message: 'Successfully joined session' });
        } catch (error) {
            console.error('Error joining session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Leave session
    leaveSession: async (req, res) => {
        const { userId } = req.body;
        const sessionId = req.params.id;

        try {
            await LiveSessionParticipant.findOneAndUpdate(
                { session_id: sessionId, user_id: userId },
                { status: 'left' }
            );

            await LiveSession.findByIdAndUpdate(sessionId, { $inc: { current_participants: -1 } });

            res.json({ message: 'Successfully left session' });
        } catch (error) {
            console.error('Error leaving session:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get sessions by user
    getSessionsByUser: async (req, res) => {
        try {
            const sessions = await LiveSession.find({ 'participants.user_id': req.params.userId })
                .populate('lesson_id', 'title')
                .populate('host_user_id', 'username first_name');

            res.json(sessions);
        } catch (error) {
            console.error('Error fetching user sessions:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update telegram chat ID and status
    updateTelegramChatId: async (req, res) => {
        const { sessionId } = req.params;
        const { telegram_chat_id } = req.body;

        try {
            const updatedSession = await LiveSession.findByIdAndUpdate(
                sessionId,
                {
                    telegram_chat_id,
                    status: 'Ongoing',
                    updated_at: Date.now()
                },
                { new: true }
            );

            if (!updatedSession) {
                return res.status(404).json({ message: 'Session not found' });
            }

            res.json({
                success: true,
                message: 'Session updated successfully',
                telegram_chat_id,
                sessionId
            });
        } catch (error) {
            console.error('Error updating telegram chat ID:', error);
            res.status(500).json({
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
            const participant = await LiveSessionParticipant.findOneAndUpdate(
                { session_id: sessionId, user_id: userId },
                { status: 'completed', completed_at: Date.now() }
            );

            if (!participant) {
                return res.status(404).json({ message: 'Participant record not found' });
            }

            res.json({
                success: true,
                message: 'Session completed for user',
                sessionId,
                userId
            });
        } catch (error) {
            console.error('Error completing session for user:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to complete session for user'
            });
        }
    }
};

module.exports = liveSessionController; 
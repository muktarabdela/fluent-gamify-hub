const express = require('express');
const router = express.Router();
const {
    getAllSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
    joinSession,
    leaveSession,
    getSessionsByType,
    getSessionsByUser
} = require('../controllers/liveSessionController');
const { getPool } = require('../config/db');

router.get('/', getAllSessions);
router.get('/type/:sessionType', getSessionsByType);
router.get('/user/:userId', getSessionsByUser);
router.get('/:id', getSessionById);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);
router.post('/:id/join', joinSession);
router.post('/:id/leave', leaveSession);
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, inviteLink } = req.body;

        const pool = getPool();
        await pool.query(
            'UPDATE LiveSessions SET status = ?, inviteLink = ? WHERE session_id = ?',
            [status, inviteLink, id]
        );

        res.json({ message: 'Session status and invite link updated successfully' });
    } catch (error) {
        console.error('Error updating session status:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 
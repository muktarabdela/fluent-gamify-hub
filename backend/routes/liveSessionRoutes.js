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
    getSessionsByUser,
    updateTelegramChatId,
    completeUserSession
} = require('../controllers/liveSessionController');
const { LiveSession } = require('../model/model');

router.get('/', getAllSessions);
router.get('/type/:sessionType', getSessionsByType);
router.get('/user/:userId', getSessionsByUser);
router.get('/:id', getSessionById);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);
router.post('/:id/join', joinSession);
router.post('/:id/leave', leaveSession);
router.put('/:sessionId/telegram-chat', updateTelegramChatId);
router.post('/:sessionId/complete', completeUserSession);

module.exports = router; 
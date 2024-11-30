const express = require('express');
const router = express.Router();
const { createNewSession, endSession } = require('../controllers/botController');

router.post('/newsession', createNewSession);
router.post('/endsession', endSession);

module.exports = router; 
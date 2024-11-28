const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get bot API URL from environment
const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';

router.post('/newsession', async (req, res) => {
    try {
        const { topic, group_id } = req.body;

        const response = await axios.post(`${BOT_API_URL}/newsession`, {
            topic,
            group_id
        }, {
            timeout: 15000
        });

        res.json({
            success: true,
            inviteLink: response.data.inviteLink,
            notificationSent: response.data.notificationSent
        });
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
});

module.exports = router; 
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../model/db');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Verify Telegram authentication
const verifyTelegramAuth = (data) => {
    const { hash, ...userData } = data;

    // Create data check string
    const dataCheckArr = Object.keys(userData)
        .sort()
        .map(key => `${key}=${userData[key]}`);
    const dataCheckString = dataCheckArr.join('\n');

    // Create hash
    const secretKey = crypto.createHash('sha256')
        .update(BOT_TOKEN)
        .digest();

    const hmac = crypto.createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    return hmac === hash;
};

// Handle Telegram authentication
router.post('/telegram', async (req, res) => {
    try {
        const userData = req.body;

        // Verify the authentication
        if (!verifyTelegramAuth(userData)) {
            return res.status(401).json({ error: 'Invalid authentication' });
        }

        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT * FROM Users WHERE user_id = ?',
            [userData.id]
        );

        if (existingUser.length === 0) {
            // Create new user
            await db.query(
                `INSERT INTO Users (user_id, username, first_name, last_name, photo_url, auth_date) 
         VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?))`,
                [
                    userData.id,
                    userData.username,
                    userData.first_name,
                    userData.last_name,
                    userData.photo_url,
                    userData.auth_date
                ]
            );
        } else {
            // Update existing user
            await db.query(
                `UPDATE Users SET 
         username = ?, 
         first_name = ?, 
         last_name = ?, 
         photo_url = ?, 
         auth_date = FROM_UNIXTIME(?)
         WHERE user_id = ?`,
                [
                    userData.username,
                    userData.first_name,
                    userData.last_name,
                    userData.photo_url,
                    userData.auth_date,
                    userData.id
                ]
            );
        }

        res.json({
            success: true,
            user: {
                id: userData.id,
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                photo_url: userData.photo_url
            }
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

module.exports = router;
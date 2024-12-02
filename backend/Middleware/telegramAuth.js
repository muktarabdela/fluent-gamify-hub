const crypto = require('crypto');

const verifyTelegramWebAppData = (req, res, next) => {
    try {
        const { hash, ...data } = req.body;

        if (!hash) {
            return res.status(401).json({ message: 'Hash is missing' });
        }

        // Sort object by keys and create data check string
        const checkString = Object.keys(data)
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join('\n');

        // Create HMAC-SHA256 hash
        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.BOT_TOKEN)
            .digest();

        const generatedHash = crypto.createHmac('sha256', secretKey)
            .update(checkString)
            .digest('hex');

        // Verify hash
        if (hash !== generatedHash) {
            return res.status(401).json({ message: 'Invalid hash' });
        }

        // Check auth date (within last 24 hours)
        const authDate = parseInt(data.auth_date);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            return res.status(401).json({ message: 'Auth date expired' });
        }

        next();
    } catch (error) {
        console.error('Telegram auth error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};

module.exports = verifyTelegramWebAppData; 
const adminToken = process.env.ADMIN_BOT_TOKEN || '';
const botId = adminToken ? adminToken.split(':')[0] : '';

module.exports = {
    ADMIN_BOT_TOKEN: process.env.ADMIN_BOT_TOKEN,
    BOT_ID: botId,
    GROUP_ID: process.env.GROUP_ID,
    MIN_MEMBERS_TO_START: 2,
    MAX_CHANNEL_MEMBERS: 10,
    SESSION_DURATION_MINUTES: 3,
    MONGODB_URI: process.env.MONGODB_URI
}; 
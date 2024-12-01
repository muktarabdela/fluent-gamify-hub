module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_ID: process.env.BOT_TOKEN.split(':')[0],
    GROUP_ID: process.env.GROUP_ID,
    MIN_MEMBERS_TO_START: 3,
    MAX_CHANNEL_MEMBERS: 50,
    SESSION_DURATION_MINUTES: 60,
    MONGODB_URI: process.env.MONGODB_URI
}; 
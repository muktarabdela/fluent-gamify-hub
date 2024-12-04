const sendNewSessionWelcomeMessage = async (bot, chatId) => {
    try {
        const welcomeMessage =
            `<b>🎯 English Speaking Session</b>\n` +
            `━━━━━━━━━━━━━━━\n` +
            `<b>📋 Topic:</b> ${sessionTopic}\n` +
            `<b>⏱ Duration:</b> ${config.SESSION_DURATION_MINUTES} mins\n` +
            `<b>👥 Members:</b> ${config.MIN_MEMBERS_TO_START}-${config.MAX_CHANNEL_MEMBERS}\n\n` +

            `<b>🚀 How to Start Voice Chat:</b>\n` +
            `1️⃣ Click the group name at the top\n` +
            `2️⃣ Tap the three dots ⋮ in the top-right corner\n` +
            `3️⃣ Select "Start Video Chat" or "Start Voice Chat"\n` +
            `4️⃣ Click the microphone 🎤 icon to speak\n\n` +

            `<b>📜 Key Rules:</b>\n` +
            `• English only\n` +
            `• Be respectful\n` +
            `• Mute when not speaking\n` +
            `• Give others a chance\n\n` +

            `<b>💡 Tips:</b>\n` +
            `• Introduce yourself\n` +
            `• Ask questions freely\n` +
            `• Share your thoughts\n\n` +

            `<i>Session starts when ${config.MIN_MEMBERS_TO_START} members join!</i>\n` +
            `━━━━━━━━━━━━━━━`;

        const mediaGroup = [
            {
                type: 'photo',
                media: { source: './images/step 1.jpg' },
                caption: welcomeMessage,
                parse_mode: 'HTML'
            },
            {
                type: 'photo',
                media: { source: './images/step 2.jpg' }
            },
            {
                type: 'photo',
                media: { source: './images/step 3.jpg' }
            }
        ];

        await bot.sendMediaGroup(chatId, mediaGroup);

    } catch (error) {
        console.error('Error sending new session welcome message:', error);
        await bot.sendMessage(chatId, "An error occurred. Please try again later.");
    }
}

module.exports = {
    sendNewSessionWelcomeMessage
}

const sendWelcomeMessage = async (telegram, chatId) => {
    try {
        const channelLink = 'https://t.me/fluent_hub';
        const webAppUrl = 'https://fluent-gamify-hub.vercel.app';
        const imageUrl = 'https://res.cloudinary.com/dczvebr3j/image/upload/v1727264037/hbampjrcszlxoohetngs.jpg';

        const welcomeMessage = `Welcome to FluentHub! 🌟
🎯 FluentHub - Your Smart Language Learning Companion:
• AI-Powered Learning Path
• Interactive Daily Challenges
• Real-time Progress Analytics
• Native Speaker Community
• Gamified Learning Experience

✨ Features:
📚 Personalized lesson plans
🎮 Interactive language games
🏆 Achievement system
👥 Community challenges
📊 Detailed progress tracking
Start your language journey today! 🚀`;

        const options = {
            caption: welcomeMessage,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🎓 Start Learning',
                            url: webAppUrl
                        }
                    ],
                    [
                        {
                            text: '📢 Join Community',
                            url: channelLink
                        }
                    ]
                ]
            }
        };

        await telegram.sendPhoto(chatId, imageUrl, options);
    } catch (error) {
        console.error('Error sending welcome message:', error);
        throw error;
    }
};

module.exports = {
    sendWelcomeMessage
};

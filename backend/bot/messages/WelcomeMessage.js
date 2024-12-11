const sendWelcomeMessage = async (telegram, chatId) => {
    try {
        const channelLink = 'https://t.me/fluent_hub';
        const webAppUrl = 'https://fluent-gamify-hub.vercel.app';
        const imageUrl = 'https://res.cloudinary.com/dczvebr3j/image/upload/v1727264037/hbampjrcszlxoohetngs.jpg';

        const welcomeMessage = `  
🎯 FluentHub - Your Ultimate Telegram English Learning Mini-App🌟 

 🎙️ Live Voice Chats on Real-World Topics  
 📈 Detailed Progress Tracking  
 🏆 Gamified Learning
 👥 Real Conversations with Real People  
 🌍 Connect and Learn Without Leaving Telegram  
        
✨ Features:  
  📚 Focused, Real-Life Lessons  
  🎮 Fun and Motivating Challenges  
  🏅 Achievement Rewards  
  📊 Track Your Growth and Milestones  
        
Start your English learning journey today and open new opportunities! 🚀`;


        const options = {
            caption: welcomeMessage,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🎓 Start Learning',
                            web_app: { url: webAppUrl }
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

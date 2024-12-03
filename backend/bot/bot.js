const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

// Replace with your bot's token from BotFather
const token = process.env.BOT_TOKEN;

// Create an instance of the bot
const bot = new TelegramBot(token, { polling: true });

const channelLink = 'https://t.me/fluent_hub';
const webAppUrl = 'https://fluent-gamify-hub.vercel.app'; // Replace with your Mini App URL
const imageUrl = 'https://res.cloudinary.com/dczvebr3j/image/upload/v1727264037/hbampjrcszlxoohetngs.jpg';

// When a user sends a message to the bot, the bot will respond
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    try {
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

        // Send image and buttons
        await bot.sendPhoto(chatId, imageUrl, options);
    } catch (error) {
        console.error('Error sending message:', error);
        bot.sendMessage(chatId, "An error occurred. Please try again later.");
    }
});

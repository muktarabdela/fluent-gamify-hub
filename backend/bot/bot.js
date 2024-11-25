const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

// Replace with your bot's token from BotFather
const token = "7300307978:AAHNBsXlsdoxvjME33YgEOThUiFLgIqkrPA";

// Create an instance of the bot
const bot = new TelegramBot(token, { polling: true });

const channelLink = 'https://t.me/everyday_change'; // Channel link
const channelUsername = '@everyday_change'; // Channel username (used to check membership)
const imageUrl = 'https://res.cloudinary.com/dczvebr3j/image/upload/v1727264037/hbampjrcszlxoohetngs.jpg'; // Image URL
const checkButtonText = 'Check'; // Text for check button

// When a user sends a message to the bot, the bot will respond
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    try {
        const welcomeMessage = "Welcome to FluentHub! 🎉\n\nYou can join the official FluentHub channel for updates, practice sessions, and more! \n\n click the link below to join our channel\n@everyday_change";

        const options = {
            caption: welcomeMessage,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: checkButtonText,
                            callback_data: 'check_membership' // Callback for checking membership
                        }
                    ]
                ]
            }
        };

        // Send image and buttons (Visit Channel and Check Membership)
        bot.sendPhoto(chatId, imageUrl, options);
    } catch (error) {
        console.error('Error sending message:', error);
        bot.sendMessage(chatId, "An error occurred. Please try again later.");
    }
});

// Listen for the "Check Membership" button press
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data; // 'check_membership' if the check button is pressed

    if (data === 'check_membership') {
        try {
            // Check if the user is a member of the channel
            const chatMember = await bot.getChatMember(channelUsername, chatId);

            if (chatMember.status === 'member' || chatMember.status === 'administrator') {
                bot.sendMessage(chatId, "🎉 You're already a member of the channel! Enjoy the updates and practice sessions.");
            } else {
                bot.sendMessage(chatId, `It looks like you haven't joined the channel yet. Please join by clicking here: ${channelLink}`);
            }
        } catch (error) {
            console.error('Error checking membership:', error);
            bot.sendMessage(chatId, "An error occurred while checking your membership status. Please try again later.");
        }
    }
});

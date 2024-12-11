const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const { sendWelcomeMessage } = require('./messages/WelcomeMessage');
const GroupManager = require('./GroupManager');

dotenv.config();

// Replace with your bot's token from BotFather
const token = process.env.MINI_BOT_TOKEN;
// Create bot instance using Telegraf
const bot = new Telegraf(token);

// Initialize GroupManager
const groupManager = new GroupManager(bot);

// Clear active groups when needed
// groupManager.clearActiveGroups();
// Start bot in a controlled manner
let botStarted = false;
const startBot = async () => {
    if (!botStarted) {
        try {
            await bot.launch();
            botStarted = true;
            console.log('Telegram bot started successfully');
        } catch (error) {
            console.error('Failed to start Telegram bot:', error);
        }
    }
};
startBot();

// Handle /start command only
bot.command('start', async (ctx) => {
    try {
        // Only send welcome message for private chats (not groups)
        if (ctx.chat.type === 'private') {
            await sendWelcomeMessage(ctx.telegram, ctx.chat.id);
        }
    } catch (error) {
        console.error('Error sending welcome message:', error);
        ctx.reply("An error occurred. Please try again later.");
    }
});

// Handle new members joining the group
bot.on('new_chat_members', async (ctx) => {
    try {
        const groupId = ctx.chat.id;
        const newMembers = ctx.message.new_chat_members;

        // Handle new members (promote them to admin if needed)
        await groupManager.handleNewMembers(groupId, newMembers);

        // Monitor group members after new members join
        await groupManager.monitorGroupMembers(groupId);
    } catch (error) {
        console.error('Error handling new chat members:', error);
    }
});

// Handle members leaving the group
bot.on('left_chat_member', async (ctx) => {
    try {
        const groupId = ctx.chat.id;

        // Monitor group members after someone leaves
        await groupManager.monitorGroupMembers(groupId);
    } catch (error) {
        console.error('Error handling left chat member:', error);
    }
});

// Handle /remove command for moderators
bot.command('remove', async (ctx) => {
    try {
        const groupId = ctx.chat.id;
        const targetUser = ctx.message.text.split(' ')[1];
        const removedBy = ctx.from.id;

        if (!targetUser) {
            return ctx.reply('Please specify a user to remove. Example: /remove @username');
        }

        const result = await groupManager.removeUser(groupId, targetUser, removedBy);
        ctx.reply(result.message);
    } catch (error) {
        console.error('Error removing user:', error);
        ctx.reply(`Failed to remove user: ${error.message}`);
    }
});

// Export both bot and groupManager
module.exports = { bot, groupManager };

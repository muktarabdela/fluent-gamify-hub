require('dotenv').config();
const axios = require('axios');
const groupManager = require('./services/channelManager');
const config = require('./config');
const express = require('express');
const app = express();
app.use(express.json());

// Add localhost URL support
const baseUrl = process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.PORT || 3000}`
    : 'https://api.telegram.org';

const botPath = `/bot${config.BOT_TOKEN}`;

let offset = 0;

async function getUpdates() {
    try {
        const response = await axios.get(`${baseUrl}${botPath}/getUpdates`, {
            params: {
                offset: offset,
                timeout: 30
            }
        });

        const updates = response.data.result;

        for (const update of updates) {
            offset = update.update_id + 1;

            // Handle voice chat updates
            if (update.message?.video_chat_started || 
                update.message?.voice_chat_started ||
                update.message?.video_chat_ended ||
                update.message?.voice_chat_ended) {
                await groupManager.handleVoiceChatUpdate(update);
            }

            if (update.message && update.message.text) {
                const message = update.message;

                // Handle /newsession command
                if (message.text.startsWith('/newsession')) {
                    const topic = message.text.split(' ').slice(1).join(' ');
                    if (!topic) {
                        await sendMessage(message.chat.id,
                            'Please provide a topic for the session: /newsession <topic>'
                        );
                        continue;
                    }

                    try {
                        const { groupId, inviteLink } = await groupManager.createTemporarySession(topic);
                        await sendMessage(message.chat.id,
                            `<b>🆕 New Session Created!</b>\n\n` +
                            `<b>📋 Topic:</b> ${topic}\n` +
                            `<b>🔗 Join:</b> ${inviteLink}\n\n` +
                            `<i>Click the link to join the session!</i>`
                        );
                    } catch (error) {
                        console.error('Error creating session:', error);
                        await sendMessage(message.chat.id,
                            'Sorry, there was an error creating the session.'
                        );
                    }
                }

                // Handle /remove command
                if (message.text.startsWith('/remove')) {
                    const userToRemove = message.text.split(' ').slice(1).join(' ').trim();
                    
                    if (!userToRemove) {
                        await sendMessage(message.chat.id,
                            'Please specify the user to remove: /remove <username or name>'
                        );
                        continue;
                    }

                    try {
                        const result = await groupManager.removeUser(
                            message.chat.id,
                            userToRemove,
                            message.from.id
                        );
                        
                        await sendMessage(message.chat.id, result.message);
                    } catch (error) {
                        await sendMessage(message.chat.id,
                            `Failed to remove user: ${error.message}`
                        );
                    }
                }
            }

            // Handle new channel members
            if (update.channel_post && update.channel_post.new_chat_members) {
                const channelId = update.channel_post.chat.id;
                await groupManager.monitorChannelMembers(channelId);
            }

            // Handle new members
            if (update.message?.new_chat_members) {
                const chatId = update.message.chat.id;
                await groupManager.handleNewMembers(
                    chatId,
                    update.message.new_chat_members
                );
                await groupManager.monitorGroupMembers(chatId);
            }
        }
    } catch (error) {
        console.error('Error getting updates:', error);
    }
}

async function sendMessage(chatId, text) {
    try {
        await axios.post(`${baseUrl}${botPath}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Add API endpoint for creating new sessions
app.post('/newsession', async (req, res) => {
    try {
        const { topic, group_id } = req.body;
        // Add validation
        if (!topic || !group_id) {
            return res.status(400).json({
                success: false,
                error: 'Both topic and group_id are required'
            });
        }

        // Format group_id
        const formattedGroupId = String(group_id).startsWith('-') ? group_id : `-${group_id}`;

        console.log("Creating session with topic:", topic, "in group:", formattedGroupId);

        try {
            const { groupId, inviteLink } = await groupManager.createTemporarySession(topic, formattedGroupId);

            res.json({
                success: true,
                groupId,
                inviteLink,
                notificationSent: false
            });
        } catch (error) {
            if (error.response?.data?.description?.includes('chat not found')) {
                return res.status(400).json({
                    success: false,
                    error: 'Bot is not a member of this group or group does not exist. Please ensure the bot is added to the group first.'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error in /newsession endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.response?.data?.description || error.message
        });
    }
});

// Start both the bot and API server
async function startBot() {
    console.log('Bot started...');
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Server URL: ${baseUrl}${botPath}`);

    // Start Express server
    const PORT = process.env.BOT_PORT || 3001; // Use different port than main backend
    app.listen(PORT, () => {
        console.log(`Bot API running on port: ${PORT}`);
    });

    // Start bot polling
    while (true) {
        await getUpdates();
    }
}

startBot();

// Handle shutdown
process.on('SIGINT', () => {
    console.log('Bot stopped');
    process.exit();
}); 
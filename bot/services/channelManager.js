const axios = require('axios');
const config = require('../config');
const fs = require('fs');
const FormData = require('form-data');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';
const webAppUrl = 'https://fluent-gamify-hub.vercel.app'; // Replace with your Mini App URL
class GroupManager {
    constructor() {
        this.baseUrl = `https://api.telegram.org/bot${config.BOT_TOKEN}`;
        this.activeGroups = new Map();
        this.voiceChatSessions = new Map();
    }

    async createTemporarySession(sessionTopic, groupId) {
        try {
            // Validate inputs
            if (!sessionTopic || !groupId) {
                throw new Error('Both sessionTopic and groupId are required');
            }

            // Prepare and verify group access
            const preparedGroupId = await this.prepareGroup(groupId);
            console.log('Creating invite link for prepared group:', preparedGroupId);

            // Set the group title to the session topic
            await axios.post(`${this.baseUrl}/setChatTitle`, {
                chat_id: preparedGroupId,
                title: `🗣 ${sessionTopic}`
            });

            // Create invite link for the group
            const createInvite = await axios.post(`${this.baseUrl}/createChatInviteLink`, {
                chat_id: preparedGroupId,
                name: `Session: ${sessionTopic}`,
                member_limit: config.MAX_CHANNEL_MEMBERS,
                expire_date: Math.floor(Date.now() / 1000) + (3600 * 2), // 2 hours from now
                creates_join_request: false
            });

            if (!createInvite.data.ok) {
                throw new Error(createInvite.data.description);
            }

            const inviteLink = createInvite.data.result;

            // Prepare the welcome message
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

            console.log('Sending welcome message with media to group:', preparedGroupId);

            // Send welcome message with media
            const formData = new FormData();
            formData.append('chat_id', preparedGroupId);
            formData.append('media', JSON.stringify([
                {
                    type: 'photo',
                    media: 'attach://photo1',
                    caption: welcomeMessage,
                    parse_mode: 'HTML'
                },
                {
                    type: 'photo',
                    media: 'attach://photo2'
                },
                {
                    type: 'photo',
                    media: 'attach://photo3'
                }
            ]));

            // Attach the actual image files
            formData.append('photo1', fs.createReadStream('./images/step 1.jpg'));
            formData.append('photo2', fs.createReadStream('./images/step 2.jpg'));
            formData.append('photo3', fs.createReadStream('./images/step 3.jpg'));

            // Send the media group first
            await axios.post(`${this.baseUrl}/sendMediaGroup`, formData, {
                headers: formData.getHeaders()
            });

            // Send additional admin control message
            const adminControlMessage =
                `📢 <b>Session Moderation Notice</b>\n` +
                `━━━━━━━━━━━━━━━\n\n` +
                `This live session is monitored by an admin bot to ensure a safe and productive learning environment.\n\n` +
                `<b>🛡 Moderation Commands:</b>\n` +
                `• Use /remove @username to remove disruptive participants\n` +
                `• Example: /remove @user123\n\n` +
                `<b>⚠️ Removable Offenses:</b>\n` +
                `• Using languages other than English\n` +
                `• Disrespectful behavior\n` +
                `• Spam or inappropriate content\n` +
                `• Disrupting the learning environment\n\n` +
                `<i>Let's maintain a positive space for everyone to practice and improve! 🌟</i>`;

            await this.sendMessage(preparedGroupId, adminControlMessage);

            const sessionInfo = {
                inviteId: inviteLink.invite_link_id,
                topic: sessionTopic,
                createdAt: Date.now(),
                memberCount: 0,
                isActive: true,
                sessionStarted: false,
                voiceChatNotificationSent: false,
                countdownStarted: false
            };

            this.activeGroups.set(inviteLink.invite_link_id, sessionInfo);

            return {
                groupId: preparedGroupId,
                inviteLink: inviteLink.invite_link
            };
        } catch (error) {
            console.error('Error creating session:', error.response?.data || error.message);
            throw error;
        }
    }

    async sendMessage(chatId, text) {
        try {
            await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            });
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error.message);
        }
    }

    async getChatMemberCount(chatId) {
        try {
            const response = await axios.get(`${this.baseUrl}/getChatMemberCount`, {
                params: { chat_id: chatId }
            });
            console.log("Member count:", response.data);
            return response.data.result;
        } catch (error) {
            console.error('Error getting member count:', error.response?.data || error.message);
            return 0;
        }
    }

    async monitorGroupMembers(groupId) {
        try {
            const memberCount = await this.getChatMemberCount(groupId);
            console.log(`Monitoring group ${groupId} - Current members: ${memberCount}`);

            // Check if we've reached exactly 3 members and haven't sent the notification yet
            if (memberCount >= 3 && !this.activeGroups.get(groupId)?.countdownStarted) {
                console.log(`Sending voice chat notification - Group has reached ${memberCount} members`);
                await this.sendMessage(groupId,
                    `🎉 Fantastic! We've got our language practice squad assembled! 🌟\n\n` +
                    `🎯 Ready to level up your speaking skills? Here's how to jump in:\n` +
                    `1️⃣ Tap the group name at the top of your screen\n` +
                    `2️⃣ Hit the magical three dots ⋮ menu\n` +
                    `3️⃣ Choose "Start Voice Chat" to begin the fun!\n\n` +
                    `💡 Quick Tips:\n` +
                    `• Don't be shy - everyone's here to learn!\n` +
                    `• Make mistakes freely - that's how we improve\n` +
                    `• Support each other with positive feedback\n\n` +
                    `🗣️ Time to bring those conversations to life!\n` +
                    `⏱ Your awesome practice session will run for 10 minutes\n\n` +
                    `Let's make every minute count! 💪`
                );

                // Start countdown timer
                this.startSessionCountdown(groupId);

                // Mark countdown as started
                const group = this.activeGroups.get(groupId);
                if (group) {
                    group.countdownStarted = true;
                }
            }
        } catch (error) {
            console.error('Error monitoring group members:', error);
        }
    }

    async startSessionCountdown(groupId) {
        console.log(`Starting countdown for group ${groupId}`);

        // Send warning at 4 minutes (1 minute remaining)
        setTimeout(async () => {
            try {
                await this.sendMessage(groupId,
                    `⏰ Time Check: Just 1 Magical Minute Left! \n\n` +
                    `🎯 Make these final moments count:\n` +
                    `• Share those last brilliant thoughts!\n` +
                    `• Exchange contact info if you'd like to practice again\n` +
                    `• End with a positive note 🌟\n\n` +
                    `You've done amazing work today! Let's wrap up this awesome conversation. 💪`
                );
            } catch (error) {
                console.error('Error sending warning message:', error);
            }
        }, 2 * 60 * 1000); // 2 minutes

        // Send session end message after 5 minutes
        setTimeout(async () => {
            try {
                // Get all chat members before ending the session
                const chatMembers = await axios.get(`${this.baseUrl}/getChatAdministrators`, {
                    params: { chat_id: groupId }
                });

                // Get all user IDs except the bot
                const botId = parseInt(config.BOT_TOKEN.split(':')[0]);
                const userIds = chatMembers.data.result
                    .filter(member => member.user.id !== botId)
                    .map(member => member.user.id);
                console.log('User IDs:', userIds);
                // Update database status for all participants
                await Promise.all(userIds.map(userId =>
                    axios.post(`${BACKEND_URL}/bot/endsession`, {
                        group_id: groupId,
                        userId: userId
                    })
                ));

                await this.sendMessage(groupId,
                    `🌟 Time's Up, Language Champions! 🎉\n\n` +
                    `What an incredible session! You've practiced, learned, and grown together. ` +
                    `Be proud of every word you spoke today! 🗣️✨\n\n` +
                    `💫 Remember:\n` +
                    `• Every conversation makes you stronger\n` +
                    `• Keep practicing what you learned today\n` +
                    `• You're one step closer to fluency!\n\n` +
                    `👋 The group will close in 5 minutes. See you next time, language superstar! ` +
                    `Keep shining and speaking! 🌈✨`
                );
                console.log('End session message sent successfully');

                // Add a small delay before sending the mini app message
                console.log('Waiting 1 second before sending mini app message...');
                await new Promise(resolve => setTimeout(resolve, 1000));

                console.log('Sending mini app message...');
                console.log('Mini app URL:', process.env.MINI_APP_URL);

                // Send mini app return message
                await axios.post(`${this.baseUrl}/sendMessage`, {
                    chat_id: groupId,
                    text: `🌟 See Your Amazing Progress!\n\n` +
                        `Want to:\n` +
                        `📈 Track your speaking journey\n` +
                        `🎯 Set new language goals\n` +
                        `🗣️ Join more fun sessions\n` +
                        `📊 See how far you've come?\n\n` +
                        `Click below to continue your English adventure!`,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{
                                text: '📊 View Progress',
                                url: webAppUrl
                            }]
                        ]
                    })
                });
                console.log('Mini app message sent successfully');

                // Remove all members and delete group after 30 seconds
                setTimeout(async () => {
                    await this.removeAllMembers(groupId);
                    await this.deleteGroup(groupId);
                }, 30 * 1000); // 30 seconds delay

            } catch (error) {
                console.error('Error in end session sequence:', error.response?.data || error.message);
            }
        }, 3 * 60 * 1000); // 3 minutes
    }

    async deleteGroup(groupId) {
        try {
            // Get all chat members before ending the session
            const chatMembers = await axios.get(`${this.baseUrl}/getChatAdministrators`, {
                params: { chat_id: groupId }
            });

            // Get all user IDs except the bot
            const botId = parseInt(config.BOT_TOKEN.split(':')[0]);
            const userIds = chatMembers.data.result
                .filter(member => member.user.id !== botId)
                .map(member => member.user.id);
            this.activeGroups.delete(groupId);
            console.log(`Session ended for group ${groupId}`);
        } catch (error) {
            console.error('Error ending session:', error.response?.data || error.message);
        }
    }

    async sendPhoto(chatId, photoPath, caption) {
        try {
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', fs.createReadStream(photoPath));
            formData.append('caption', caption);

            await axios.post(`${this.baseUrl}/sendPhoto`, formData, {
                headers: formData.getHeaders()
            });
        } catch (error) {
            console.error('Error sending photo:', error.response?.data || error.message);
        }
    }

    async verifyGroupAccess(groupId) {
        try {
            const formattedGroupId = String(groupId).startsWith('-') ? groupId : `-${groupId}`;
            const response = await axios.get(`${this.baseUrl}/getChat`, {
                params: { chat_id: formattedGroupId }
            });

            if (!response.data.ok) {
                return false;
            }

            // Also verify bot permissions
            const botMember = await axios.get(`${this.baseUrl}/getChatMember`, {
                params: {
                    chat_id: formattedGroupId,
                    user_id: config.BOT_TOKEN.split(':')[0]
                }
            });

            return botMember.data.result.status === 'administrator';
        } catch (error) {
            console.error('Error verifying group access:', error.response?.data || error.message);
            return false;
        }
    }

    async prepareGroup(groupId) {
        try {
            const formattedGroupId = String(groupId).startsWith('-') ? groupId : `-${groupId}`;

            // First check if bot is already a member and has admin rights
            const isAccessible = await this.verifyGroupAccess(formattedGroupId);
            if (isAccessible) {
                return formattedGroupId;
            }

            // If not accessible, try to join the group first
            try {
                await axios.post(`${this.baseUrl}/joinChat`, {
                    chat_id: formattedGroupId
                });

                // Wait a bit for the join to process
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Verify access again after joining
                const accessAfterJoin = await this.verifyGroupAccess(formattedGroupId);
                if (!accessAfterJoin) {
                    throw new Error('Bot could not get admin rights after joining');
                }

                return formattedGroupId;
            } catch (error) {
                console.error('Error joining group:', error.response?.data || error.message);
                throw new Error(`Bot cannot access group ${formattedGroupId}. Please add the bot to the group manually and make it an administrator.`);
            }
        } catch (error) {
            throw error;
        }
    }

    async doesGroupExist(groupId) {
        try {
            const formattedGroupId = String(groupId).startsWith('-') ? groupId : `-${groupId}`;
            const response = await axios.get(`${this.baseUrl}/getChat`, {
                params: { chat_id: formattedGroupId }
            });
            return response.data.ok;
        } catch (error) {
            return false;
        }
    }

    async handleVoiceChatUpdate(update) {
        const chatId = update.message?.chat?.id;
        if (!chatId || !this.activeGroups.has(chatId)) return;

        console.log('Voice chat update received:', {
            chatId,
            hasVideoStart: !!update.message?.video_chat_started,
            hasVoiceStart: !!update.message?.voice_chat_started,
            hasVideoEnd: !!update.message?.video_chat_ended,
            hasVoiceEnd: !!update.message?.voice_chat_ended
        });

        // Check if this is a voice chat started event
        if (update.message?.video_chat_started || update.message?.voice_chat_started) {
            console.log('Voice chat started in group:', chatId);
            await this.handleVoiceChatStart(chatId);
        }
        // Check if this is a voice chat ended event
        else if (update.message?.video_chat_ended || update.message?.voice_chat_ended) {
            console.log('Voice chat ended in group:', chatId);
            await this.handleVoiceChatEnd(chatId);
        }
    }

    async handleVoiceChatStart(chatId) {
        const group = this.activeGroups.get(chatId);
        if (!group || group.voiceChatStarted) return;

        group.voiceChatStarted = true;
        group.voiceChatStartTime = Date.now();

        // Send start message
        await this.sendMessage(chatId,
            `🎙 Voice chat started!\n` +
            `⏱ Session duration: ${config.SESSION_DURATION_MINUTES} minutes\n` +
            `\nEnjoy your conversation!`
        );

        // Start the countdown timer
        this.startVoiceChatTimer(chatId);
    }

    async handleVoiceChatEnd(chatId) {
        const group = this.activeGroups.get(chatId);
        if (!group || !group.voiceChatStarted) return;

        await this.sendMessage(chatId,
            `Voice chat ended. You can start a new one if needed within your session time.`
        );
    }

    async startVoiceChatTimer(chatId) {
        const group = this.activeGroups.get(chatId);
        const sessionDuration = config.SESSION_DURATION_MINUTES * 60 * 1000;
        const warningIntervals = [15, 5, 1]; // Minutes before end to send warnings

        // Set warnings
        warningIntervals.forEach(minutes => {
            setTimeout(async () => {
                if (this.activeGroups.has(chatId)) {
                    await this.sendMessage(chatId,
                        `⚠️ ${minutes} minute${minutes > 1 ? 's' : ''} remaining in the session!\n` +
                        `Please wrap up your conversation.`
                    );
                }
            }, sessionDuration - (minutes * 60 * 1000));
        });

        // End session timer
        setTimeout(async () => {
            if (this.activeGroups.has(chatId)) {
                await this.sendMessage(chatId,
                    `🔚 Session time is up!\n\n` +
                    `Thank you for participating. If you'd like to continue practicing, ` +
                    `please create a new session with a different topic using the mini app.`
                );

                // Set 5-minute grace period before deletion
                setTimeout(async () => {
                    await this.deleteGroup(chatId);
                }, 2 * 60 * 1000);
            }
        }, sessionDuration);
    }

    async handleNewMembers(chatId, newMembers) {
        try {
            const botId = parseInt(config.BOT_TOKEN.split(':')[0]);
            const memberCount = await this.getChatMemberCount(chatId);

            console.log(`New members joined group ${chatId}:`);
            console.log(`- Current total members: ${memberCount}`);
            console.log(`- New members joining: ${newMembers.length}`);

            for (const member of newMembers) {
                if (member.id === botId) {
                    console.log(`- Skipping bot (${member.id})`);
                    continue;
                }

                console.log(`- Promoting user ${member.id} (${member.first_name}) to admin`);
                await axios.post(`${this.baseUrl}/promoteChatMember`, {
                    chat_id: chatId,
                    user_id: member.id,
                    can_manage_chat: true,
                    can_manage_video_chats: true,
                });
            }
        } catch (error) {
            console.error('Error promoting new members to admin:', error.response?.data || error.message);
        }
    }

    // Add new method to remove all members
    async removeAllMembers(groupId) {
        try {
            // Get all chat members
            const chatMembers = await axios.get(`${this.baseUrl}/getChatAdministrators`, {
                params: { chat_id: groupId }
            });

            const botId = parseInt(config.BOT_TOKEN.split(':')[0]);
            console.log(`Bot ID: ${botId} will be kept in the group`);

            // Remove each member except the bot and group owner
            for (const member of chatMembers.data.result) {
                // Skip bot and group owner
                if (member.user.id === botId || member.status === 'creator') {
                    console.log(`Skipping ${member.status === 'creator' ? 'owner' : 'bot'} ${member.user.id}`);
                    continue;
                }

                console.log(`Removing user ${member.user.id} from group ${groupId}`);
                try {
                    await axios.post(`${this.baseUrl}/banChatMember`, {
                        chat_id: groupId,
                        user_id: member.user.id
                    });

                    // Immediately unban to allow them to rejoin future sessions
                    await axios.post(`${this.baseUrl}/unbanChatMember`, {
                        chat_id: groupId,
                        user_id: member.user.id
                    });
                } catch (error) {
                    console.error(`Error removing user ${member.user.id}:`, error.response?.data || error.message);
                }
            }
            this.activeGroups.delete(groupId);
            console.log(`Session ended for group ${groupId}`);

        } catch (error) {
            console.error('Error removing members:', error.response?.data || error.message);
        }
    }

    async removeUser(groupId, targetUser, removedBy) {
        try {
            // Get user info from username or name
            const chatMember = await this.findChatMember(groupId, targetUser);
            if (!chatMember) {
                throw new Error('User not found in this group');
            }

            const userId = chatMember.user.id;
            const botId = parseInt(config.BOT_TOKEN.split(':')[0]);

            // Prevent removing bot or group owner
            if (userId === botId || chatMember.status === 'creator') {
                throw new Error('Cannot remove bot or group owner');
            }

            // Ban the user
            await axios.post(`${this.baseUrl}/banChatMember`, {
                chat_id: groupId,
                user_id: userId,
                until_date: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Unban after 24 hours
            });

            // Store removal info in database (you'll need to implement this)
            await axios.post(`${BACKEND_URL}/bot/userban`, {
                group_id: groupId,
                user_id: userId,
                removed_by: removedBy,
                unban_date: new Date(Date.now() + (24 * 60 * 60 * 1000))
            });

            return {
                success: true,
                message: `User ${chatMember.user.first_name} has been removed from the group`
            };
        } catch (error) {
            console.error('Error removing user:', error);
            throw error;
        }
    }

    async findChatMember(groupId, userIdentifier) {
        try {
            // Get all chat members
            const chatMembers = await axios.get(`${this.baseUrl}/getChatAdministrators`, {
                params: { chat_id: groupId }
            });

            // Search for user by username or first name
            return chatMembers.data.result.find(member =>
                member.user.username?.toLowerCase() === userIdentifier.toLowerCase().replace('@', '') ||
                member.user.first_name?.toLowerCase() === userIdentifier.toLowerCase()
            );
        } catch (error) {
            console.error('Error finding chat member:', error);
            return null;
        }
    }
}

module.exports = new GroupManager();
module.exports = new GroupManager(); 
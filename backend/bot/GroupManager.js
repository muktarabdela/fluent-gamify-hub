const config = require('./config'); // Adjust path as needed
const { getPool } = require('../config/db');
const { TelegramGroup, LiveSession } = require('../model/model');
const webAppUrl = 'https://fluent-gamify-hub.vercel.app';

class GroupManager {
    constructor(bot) {
        this.bot = bot;
        this.activeGroups = new Map();
    }
    async clearActiveGroups() {
        this.activeGroups.clear();
        console.log("All active groups have been cleared.");
    }

    async prepareGroup(groupId) {
        // console.log('Preparing group with ID:', groupId);
        try {
            // console.log('Preparing group with ID:', groupId);
            1000013034277
            if (!groupId) {
                throw new Error('Group ID is required');
            }

            // Ensure groupId is a string and has the correct format
            const formattedGroupId = String(groupId).startsWith('-') ? groupId : `-${groupId}`;

            // console.log('Checking bot membership for group:', formattedGroupId);

            try {
                // First verify the chat exists and bot can access it
                const chat = await this.bot.telegram.getChat(formattedGroupId);
                // console.log('Chat found:', chat.title);

                const chatMember = await this.bot.telegram.getChatMember(formattedGroupId, this.bot.botInfo.id);
                // console.log('Bot status in group:', chatMember.status);

                if (!chatMember || !['administrator', 'creator'].includes(chatMember.status)) {
                    throw new Error('Bot must be an administrator in the group');
                }

                return formattedGroupId;
            } catch (error) {
                if (error.description?.includes('chat not found')) {
                    throw new Error('Group not found. Please ensure the group exists and the bot is a member of it.');
                }
                throw error;
            }
        } catch (error) {
            console.error('Group preparation failed:', error);
            throw new Error(`Failed to prepare group: ${error.message}`);
        }
    }

    async createTemporarySession(sessionTopic, groupId, duration) {
        console.log("duration when createTemporarySession from line 54", duration)
        try {
            if (!sessionTopic || !groupId || !duration) {
                throw new Error('Both sessionTopic and groupId are required');
            }

            const preparedGroupId = await this.prepareGroup(groupId);

            // Create invite link with more specific parameters
            const inviteLink = await this.bot.telegram.createChatInviteLink(preparedGroupId, {
                name: `Session: ${sessionTopic}`,
                member_limit: config.MAX_CHANNEL_MEMBERS,
                expire_date: Math.floor(Date.now() / 1000) + (3600 * 2), // 2 hours
                creates_join_request: false
            });

            // Set chat title and description
            await this.bot.telegram.setChatTitle(preparedGroupId, `🗣 ${sessionTopic}`);
            await this.bot.telegram.setChatDescription(
                preparedGroupId,
                `Live Language Learning Session\nTopic: ${sessionTopic}\nCreated: ${new Date().toLocaleString()}`
            );

            // Send welcome messages
            await this.sendSessionWelcomeMessages(preparedGroupId, sessionTopic, duration);
            // Store session info
            if (!this.activeGroups.has(preparedGroupId)) {
                this.activeGroups.set(preparedGroupId, {
                    groupId: preparedGroupId,
                    inviteId: inviteLink.invite_link_id,
                    topic: sessionTopic,
                    duration: duration,
                    createdAt: Date.now(),
                    memberCount: 0,
                    isActive: true,
                    sessionStarted: true,
                    voiceChatStarted: false
                });
                await this.monitorVoiceChatStatus(preparedGroupId);
                // console.log('Voice chat monitoring started for group:', preparedGroupId);
                // Call monitorGroupMembers after adding the group
                await this.monitorGroupMembers(preparedGroupId);
            } else {
                console.log(`Group with ID ${groupId} already exists. Updating existing entry.`);
                // Update the existing entry if necessary
            }

            return {
                groupId: preparedGroupId,
                inviteLink: inviteLink.invite_link
            };

        } catch (error) {
            console.error('Error creating session:', error);
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }

    async sendSessionWelcomeMessages(groupId, topic, duration) {
        try {
            const welcomeMessage =
                `🎉 <b>Welcome to the Live Language Session!</b>\n\n` +
                `📚 <b>Topic:</b> ${topic}\n` +
                `⏰ <b>Duration:</b> ${duration} minutes\n\n` +

                `<b>🚀 How to Start Voice Chat:</b>\n` +
                `1️⃣ Click the group name at the top\n` +
                `2️⃣ Tap the three dots ⋮ in the top-right corner\n` +
                `3️⃣ Select "Start Video Chat" or "Start Voice Chat"\n` +
                `4️⃣ Click the microphone 🎤 icon to speak\n\n` +

                `<b>💡 Tips:</b>\n` +
                `• Introduce yourself\n` +
                `• Ask questions freely\n` +
                `• Share your thoughts\n\n` +
                `<i>Please wait for other participants to join...</i>`;

            await this.bot.telegram.sendMessage(groupId, welcomeMessage, {
                parse_mode: 'HTML'
            });

            // Send admin control message
            const adminControlMessage =
                `📢 <b>Session Moderation Notice</b>\n` +
                `━━━━━━━━━━━━━━━\n\n` +
                ` Quick reminder – our bot admin's here to help keep things smooth. 🙌n\n` +
                `<b>🛡 Moderation Tips:</b>\n` +
                `•  Disruptive participants? you can use /remove @username. to remove\n` +
                `• Example: /remove @user123\n\n` +
                `<b>⚠️ Rules:</b>\n` +
                `• Keep it in English! 🌍\n` +
                `• Be kind, no spamming! 🚫\n` +
                `• Spam or inappropriate content\n` +
                `•  Let’s keep it fun and productive! 🎯\n\n` +
                `<i>Let’s make this a great session! 🌟</i>`;

            await this.bot.telegram.sendMessage(groupId, adminControlMessage, {
                parse_mode: 'HTML'
            });

            // // Send moderation notice
            // const moderationMessage =
            //     `📢 <b>Session Guidelines</b>\n` +
            //     `━━━━━━━━━━━━━━━\n\n` +
            //     `• Please use English only\n` +
            //     `• Be respectful to all participants\n` +
            //     `• Stay on topic\n` +
            //     `• Follow moderator instructions\n\n` +
            //     `<i>Enjoy your learning session! 🌟</i>\n\n` +
            //     `<i>Session starts when 3 members join!</i>`;

            // await this.bot.telegram.sendMessage(groupId, moderationMessage, {
            //     parse_mode: 'HTML'
            // });
        } catch (error) {
            console.error('Error sending welcome messages:', error);
            throw error;
        }
    }

    async getChatMemberCount(groupId) {
        try {
            const count = await this.bot.telegram.getChatMembersCount(groupId);
            // console.log(`Member count for group ${groupId}:`, count);
            return count;
        } catch (error) {
            console.error('Error getting member count:', error);
            return 0;
        }
    }
    async monitorGroupMembers(groupId) {
        try {
            const normalizedGroupId = String(groupId);
            const group = this.activeGroups.get(normalizedGroupId);
            // console.log(`group data from monitorGroupMembers for group id${groupId} in line 188`, group)

            // Ensure the group exists in activeGroups
            if (!group) {
                console.log(`Group ${normalizedGroupId} not found in activeGroups.`);
                return;
            }

            // Fetch the total number of members in the group
            const totalMemberCount = await this.getChatMemberCount(groupId);
            const actualParticipantCount = totalMemberCount - 2; // Exclude bot and admin

            console.log(`Monitoring group: ${groupId}, Participant count: ${actualParticipantCount}`);

            if (actualParticipantCount < 2) {
                console.log(`Insufficient participants in group ${groupId}. Initiating session termination countdown.`);
                await this.notifyInsufficientParticipants(groupId);

                // Start a 2-minute countdown for session termination
                group.terminationTimer = setTimeout(async () => {
                    const updatedMemberCount = await this.getChatMemberCount(groupId);
                    const updatedParticipantCount = updatedMemberCount - 2;

                    if (updatedParticipantCount < 2) {
                        console.log(`Ending session for group ${groupId} due to insufficient participants.`);
                        await this.endSession(groupId);
                    }
                }, 2 * 60 * 1000);

                return;
            }

            // If participant count is sufficient, notify members to start a voice chat
            console.log(`Sufficient participants in group ${groupId}. Prompting to start voice chat.`);
            await this.notifyStartVoiceChat(groupId);

            // Start a 5-minute timer to check for voice chat initiation
            group.voiceChatCheckTimer = setTimeout(async () => {
                const currentGroup = this.activeGroups.get(normalizedGroupId);

                if (currentGroup && !currentGroup.voiceChatStarted) {
                    console.log(`No voice chat started for group ${groupId}. Sending final reminder.`);
                    await this.bot.telegram.sendMessage(
                        groupId,
                        `⚠️ No voice chat started! The session will end in 1 minute if no action is taken.`
                    );

                    // Final 1-minute timer before ending the session
                    setTimeout(async () => {
                        const updatedGroup = this.activeGroups.get(normalizedGroupId);

                        if (updatedGroup && !updatedGroup.voiceChatStarted) {
                            console.log(`Ending session for group ${groupId} due to inactivity.`);
                            await this.endSession(groupId);
                        } else {
                            console.log(`Voice chat started for group ${groupId}. Session continues.`);
                        }
                    }, 1 * 60 * 1000);
                }
            }, 5 * 60 * 1000);
        } catch (error) {
            console.error(`Error monitoring group members in group ${groupId}:`, error);
        }
    }

    // Helper Methods
    async notifyInsufficientParticipants(groupId) {
        await this.bot.telegram.sendMessage(
            groupId,
            `🚨 Not enough participants to continue the session.\n` +
            `👥 Minimum required: 2 participants.\n` +
            `⏳ The session will end in 2 minutes unless more members join.`
        );
    }

    async notifyStartVoiceChat(groupId) {
        await this.bot.telegram.sendMessage(
            groupId,
            `🎉 We have enough participants! 🌟\n\n` +
            `🎯 Let’s level up our speaking skills:\n` +
            `1️⃣ Tap the group name at the top.\n` +
            `2️⃣ Hit the three dots menu.\n` +
            `3️⃣ Select “Start Voice Chat” and join the fun!\n\n` +
            `💡 Quick Tips:\n` +
            `• Don’t be shy; we’re here to learn together!\n` +
            `• Mistakes are welcome; they help us grow!\n` +
            `• Encourage and support each other!`
        );
        await this.bot.telegram.sendMessage(
            groupId,
            `⚠️ Please start the voice chat within 5 minutes to continue the session.`
        );
    }

    // async endSession(groupId) {
    //     await this.bot.telegram.sendMessage(
    //         groupId,
    //         `🚨 Time's up! The session is ending now due to insufficient participants.\n` +
    //         `👥 Please try again when more members are available.`
    //     );

    //     // Notify admins and clean up session data
    //     const admins = await this.bot.telegram.getChatAdministrators(groupId);
    //     const userIds = admins.filter(admin => !admin.user.is_bot).map(admin => admin.user.id);

    //     // End session logic
    //     await this.endSessionLogic(groupId, userIds);
    // }

    // async endSessionLogic(groupId, userIds) {
    //     // Placeholder for session cleanup logic
    //     console.log(`Session for group ${groupId} has been terminated. Notified admins:`, userIds);
    //     this.activeGroups.delete(groupId);
    // }


    async startSessionCountdown(groupId) {
        // console.log(`Starting countdown for group ${groupId}`);

        // Warning at 30 seconds remaining (adjusted for 3-minute session)
        setTimeout(async () => {
            try {
                await this.bot.telegram.sendMessage(groupId,
                    `⏰ Time Check: Just 30 Seconds Left! \n\n` +
                    `🎯 Make these final moments count:\n` +
                    `• Share those last brilliant thoughts!\n` +
                    `• Exchange contact info if you'd like to practice again\n` +
                    `• End with a positive note 🌟`,
                    { parse_mode: 'HTML' }
                );
            } catch (error) {
                console.error('Error sending warning message:', error);
            }
        }, 150 * 1000); // 2.5 minutes (150 seconds)

        // Session end
        setTimeout(async () => {
            try {
                const admins = await this.bot.telegram.getChatAdministrators(groupId);
                const userIds = admins
                    .filter(admin => !admin.user.is_bot)
                    .map(admin => admin.user.id);
                await this.bot.telegram.sendMessage(groupId,
                    `🌟 Time's Up, Language Champions! 🎉\n\n` +
                    `What an incredible session! You've practiced, learned, and grown together.\n\n` +
                    `The group will close in 5 minutes. See you next time! 🌈✨`,
                    { parse_mode: 'HTML' }
                );
                // Clean up after 5 minutes
                setTimeout(async () => {
                    await this.endSession(groupId, userIds);
                }, 1 * 60 * 1000);
            } catch (error) {
                console.error('Error in end session sequence:', error);
            }
        }, 5 * 60 * 1000);
    }

    async startVoiceChatTimer(groupId) {
        const warningTimes = [4, 3, 2]; // Minutes before end to send warnings
        // const warningTimes = [15, 10, 5]; // Minutes before end to send warnings
        const normalizedGroupId = String(groupId);
        const group = this.activeGroups.get(normalizedGroupId);

        if (!group) {
            console.error(`Group not found for ID: ${normalizedGroupId}`);
            return;
        }

        const duration = group.duration * 60 * 1000; // Convert minutes to milliseconds
        console.log(`Session duration: ${duration / 60000} minutes`);

        // Schedule warning messages
        warningTimes.forEach((minutes) => {
            const warningTime = duration - minutes * 60 * 1000; // Calculate warning time
            if (warningTime > 0) {
                setTimeout(async () => {
                    if (this.activeGroups.has(normalizedGroupId)) {
                        try {
                            await this.bot.telegram.sendMessage(
                                normalizedGroupId,
                                `⏰ ${minutes} minutes left—how is everyone doing?`,
                                { parse_mode: 'HTML' }
                            );
                        } catch (error) {
                            console.error(`Error sending ${minutes}-minute warning:`, error);
                        }
                    }
                }, warningTime);
            }
        });

        // Final warning at 1 second remaining
        setTimeout(async () => {
            try {
                await this.bot.telegram.sendMessage(
                    normalizedGroupId,
                    `⏰ Time Check: Just 5 minutes Left! \n\n` +
                    `🎯 Make these final moments count:\n` +
                    `• Share last thoughts!\n` +
                    `• Exchange contact info.\n` +
                    `• End with positivity! 🌟`,
                    { parse_mode: 'HTML' }
                );
            } catch (error) {
                console.error('Error sending final warning message:', error);
            }
        }, duration - 1 * 60 * 1000);

        // End session and notify
        setTimeout(async () => {
            try {
                const admins = await this.bot.telegram.getChatAdministrators(normalizedGroupId);
                const userIds = admins
                    .filter((admin) => !admin.user.is_bot)
                    .map((admin) => admin.user.id);

                await this.bot.telegram.sendMessage(
                    normalizedGroupId,
                    `🌟 Time's Up, Language Champions! 🎉\n\n` +
                    `The session has ended. The group will close in 5 minutes.\n` +
                    `Thank you for participating! See you next time! 🌈✨`,
                    { parse_mode: 'HTML' }
                );
                // Send mini app return message
                // await this.bot.telegram.sendMessage(
                //     normalizedGroupId,
                //     `🌟 See Your Amazing Progress!\n\n` +
                //     `Want to:\n` +
                //     `📈 Track your speaking journey\n` +
                //     `🎯 Set new language goals\n` +
                //     `🗣️ Join more fun sessions\n` +
                //     `📊 See how far you've come?\n\n` +
                //     `Click below to continue your English adventure!`,
                //     {
                //         reply_markup: {
                //             inline_keyboard: [
                //                 [
                //                     {
                //                         text: '📦 View Progress',
                //                         web_app: { url: webAppUrl }
                //                     }
                //                 ]
                //             ]
                //         }
                //     }
                // );



                // Clean up and end session after 5 minutes
                setTimeout(async () => {
                    await this.endSession(normalizedGroupId, userIds);
                }, 5 * 60 * 1000);
            } catch (error) {
                console.error('Error in end session sequence:', error);
            }
        }, duration);
    }

    async handleNewMembers(chatId, newMembers) {
        try {
            const botId = this.bot.botInfo.id;
            const memberCount = await this.getChatMemberCount(chatId);

            // console.log(`New members joined group ${chatId}:`);
            // console.log(`- Current total members: ${memberCount}`);
            // console.log(`- New members joining: ${newMembers.length}`);

            for (const member of newMembers) {
                if (member.id === botId) {
                    console.log(`- Skipping bot (${member.id})`);
                    continue;
                }

                // console.log(`- Promoting user ${member.id} (${member.first_name}) to admin`);
                try {
                    await this.bot.telegram.promoteChatMember(chatId, member.id, {
                        can_manage_chat: true,
                        can_manage_video_chats: true,
                        can_delete_messages: true,
                        can_restrict_members: true,
                        can_invite_users: true,
                        can_pin_messages: true
                    });

                    // console.log(`Successfully promoted ${member.first_name} to admin`);

                    // Send confirmation message
                    await this.bot.telegram.sendMessage(chatId,
                        `Welcome ${member.first_name}! 🎉\n`,
                        { parse_mode: 'HTML' }
                    );
                } catch (promotionError) {
                    console.error(`Failed to promote ${member.first_name}:`, promotionError);
                }
            }
        } catch (error) {
            console.error('Error handling new members:', error);
        }
    }
    async removeAllMembers(groupId) {
        try {
            const admins = await this.bot.telegram.getChatAdministrators(groupId);

            for (const member of admins) {
                if (member.user.is_bot || member.status === 'creator') continue;

                await this.bot.telegram.banChatMember(groupId, member.user.id);
                await this.bot.telegram.unbanChatMember(groupId, member.user.id);
            }
            const normalizedGroupId = String(groupId);
            this.activeGroups.delete(normalizedGroupId);
            console.log(`All members removed from group ${groupId}`);
        } catch (error) {
            console.error('Error removing members:', error);
        }
    }
    async removeUser(groupId, targetUser, removedBy) {
        try {
            const member = await this.findChatMember(groupId, targetUser);
            if (!member) throw new Error('User not found');

            if (member.user.is_bot || member.status === 'creator') {
                throw new Error('Cannot remove bot or group owner');
            }

            await this.bot.telegram.banChatMember(groupId, member.user.id, {
                until_date: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
            });

            return {
                success: true,
                message: `User ${member.user.first_name} has been removed`
            };
        } catch (error) {
            console.error('Error removing user:', error);
            throw error;
        }
    }
    async findChatMember(groupId, userIdentifier) {
        try {
            const admins = await this.bot.telegram.getChatAdministrators(groupId);
            return admins.find(member =>
                member.user.username?.toLowerCase() === userIdentifier.toLowerCase().replace('@', '') ||
                member.user.first_name?.toLowerCase() === userIdentifier.toLowerCase()
            );
        } catch (error) {
            console.error('Error finding chat member:', error);
            return null;
        }
    }
    async endSession(groupId) {
        console.log(`Ending session for group ${groupId}`);
        try {
            const normalizedGroupId = String(groupId);

            // Check if the group is in activeGroups
            const group = this.activeGroups.get(normalizedGroupId);
            if (!group) {
                console.log(`Group ${normalizedGroupId} not found in activeGroups. Skipping session end.`);
                return;
            }

            // Fetch the TelegramGroup document
            const telegramGroup = await TelegramGroup.findOne({ telegram_chat_id: groupId.toString() });

            if (!telegramGroup) {
                throw new Error('Telegram group not found');
            }

            const internalGroupId = telegramGroup.group_id;

            // Fetch the active session
            // Check if a LiveSession already exists for the group
            let liveSession = await LiveSession.findOne({ telegram_chat_id: groupId.toString() });

            if (!liveSession) {
                throw new Error('Active session not found');
            }

            const sessionId = liveSession._id;

            // Update database documents
            await Promise.all([
                LiveSession.updateMany(
                    { telegram_chat_id: groupId.toString(), status: { $ne: 'Ended' } },
                    {
                        $set: {
                            status: 'Scheduled',
                            current_participants: 0,
                            updated_at: new Date()
                        }
                    }
                ),
                TelegramGroup.updateOne(
                    { telegram_chat_id: groupId.toString() },
                    {
                        $set: {
                            status: 'available',
                            updated_at: new Date(),
                            last_used_at: new Date()
                        }
                    }
                )
            ]);

            // Notify group about session end
            await this.bot.telegram.sendMessage(
                groupId,
                `🔚 <b>Session Ended</b>\n\n` +
                `Thank you for participating in this language practice session!\n` +
                `The group will be reset for the next session.`,
                { parse_mode: 'HTML' }
            );

            // Clear chat history for all users
            try {
                const messages = await this.bot.telegram.getChatMessages(groupId); // Retrieve bot's messages
                for (const message of messages) {
                    await this.bot.telegram.deleteMessage(groupId, message.message_id); // Delete bot's messages
                }
            } catch (error) {
                console.error('Error deleting bot messages:', error);
            }

            // Reset group settings
            try {
                await this.bot.telegram.setChatTitle(groupId, `Language Practice Group`);
                await this.bot.telegram.setChatDescription(
                    groupId,
                    `This group is available for new language practice sessions.`
                );
            } catch (error) {
                console.error('Error resetting group details:', error);
            }

            // Clear timers for the group
            if (group.terminationTimer) clearTimeout(group.terminationTimer);
            if (group.voiceChatCheckTimer) clearTimeout(group.voiceChatCheckTimer);

            // Remove all members except bot and owner
            await this.removeAllMembers(groupId);

            // Remove group from activeGroups
            this.activeGroups.delete(normalizedGroupId);

            console.log(this.activeGroups);

            return {
                success: true,
                message: 'Session ended, chat history cleared, and group reset successfully'
            };

        } catch (error) {
            console.error('Error ending session:', error);
            throw new Error(`Failed to end session: ${error.message}`);
        }
    }



    async monitorVoiceChatStatus(groupId) {
        const normalizedGroupId = String(groupId);
        const group = this.activeGroups.get(normalizedGroupId);
        const duration = group.duration

        try {
            // console.log('Setting up voice chat monitoring for group:', groupId);
            // Listen for voice chat started
            this.bot.on('video_chat_started', async (ctx) => {
                console.log('Video chat event received:', ctx.chat.id, groupId);
                if (ctx.chat.id.toString() === groupId.toString()) {
                    console.log(`🎥 Voice/Video chat started in group ${groupId}`);
                    // console.log('Chat title:', ctx.chat.title);
                    console.log('Started by user:', ctx.from?.first_name);

                    const totalMembers = await this.getChatMemberCount(groupId);
                    const actualParticipants = totalMembers - 2;

                    if (actualParticipants >= 2) {
                        // Start the voice chat timer
                        this.startVoiceChatTimer(groupId);

                        // Update session info
                        const group = Array.from(this.activeGroups.entries())
                            .find(([_, info]) => info.groupId === groupId);
                        if (group) {
                            group[1].voiceChatStarted = true;
                        }

                        await this.bot.telegram.sendMessage(groupId,
                            `🎉 Voice chat started successfully!\n` +
                            `Session timer has begun. The session will last for ${duration} minutes. Enjoy your practice!`
                        );
                    } else {
                        await this.bot.telegram.sendMessage(groupId,
                            `⚠️ Cannot start session with less than 3 participants.\n` +
                            `Please wait for more participants to join.`
                        );
                    }
                }
            });

            // Listen for voice chat ended
            this.bot.on('video_chat_ended', (ctx) => {
                if (ctx.chat.id.toString() === groupId.toString()) {
                    console.log(`📍 Voice/Video chat ended in group ${groupId}`);
                    console.log('Duration:', ctx.videoChatDuration, 'seconds');
                    console.log('Ended by user:', ctx.from?.first_name);
                }
            });

            // Listen for participants
            this.bot.on('video_chat_participants_invited', (ctx) => {
                if (ctx.chat.id.toString() === groupId.toString()) {
                    const participants = ctx.videoChatParticipantsInvited.users;
                    console.log(`👥 New participants joined voice chat in group ${groupId}:`);
                    participants.forEach(user => {
                        console.log(`- ${user.first_name} (ID: ${user.id})`);
                    });
                }
            });

            console.log(`✅ Voice chat monitoring initialized for group ${groupId}`);
        } catch (error) {
            console.error('❌ Error monitoring voice chat status:', error);
        }
    }

    // async startActiveSessionTimer(groupId) {
    //     const duration = 60 * 60 * 1000; // 1 hour
    //     console.log(`Starting active session timer for group ${groupId}`);

    //     // Periodic updates
    //     setInterval(async () => {
    //         if (this.activeGroups.has(groupId)) {
    //             await this.bot.telegram.sendMessage(groupId,
    //                 `⏰ 15 minutes passed—how is everyone doing?`
    //             );
    //         }
    //     }, 15 * 60 * 1000); // 15 minutes

    //     // End session after duration
    //     setTimeout(async () => {
    //         await this.endSession(groupId, []);
    //     }, duration);
    // }
}

module.exports = GroupManager;
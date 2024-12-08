const config = require('./config'); // Adjust path as needed
const { getPool } = require('../config/db');

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
        try {
            if (!sessionTopic || !groupId) {
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
            await this.monitorVoiceChatStatus(preparedGroupId);
            // console.log('Voice chat monitoring started for group:', preparedGroupId);

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

            } else {
                console.log(`Group with ID ${groupId} already exists. Updating existing entry.`);
                // Update the existing entry if necessary
            }

            // Send welcome messages
            await this.sendSessionWelcomeMessages(preparedGroupId, sessionTopic, duration);
            await this.monitorGroupMembers(preparedGroupId)
            // Start monitoring voice chat status for this group
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
                `This live session is monitored by an admin bot to ensure a safe and productive learning environment.\n\n` +
                `<b>🛡 Moderation Commands:</b>\n` +
                `• Use /remove @username to remove disruptive participants\n` +
                `• Example: /remove @user123\n\n` +
                `<b>⚠️ Key Rules:</b>\n` +
                `• Using languages other than English\n` +
                `• Disrespectful behavior\n` +
                `• Spam or inappropriate content\n` +
                `• Disrupting the learning environment\n\n` +
                `<i>Let's maintain a positive space for everyone to practice and improve! 🌟</i>`;

            await this.bot.telegram.sendMessage(groupId, adminControlMessage, {
                parse_mode: 'HTML'
            });

            // Send moderation notice
            const moderationMessage =
                `📢 <b>Session Guidelines</b>\n` +
                `━━━━━━━━━━━━━━━\n\n` +
                `• Please use English only\n` +
                `• Be respectful to all participants\n` +
                `• Stay on topic\n` +
                `• Follow moderator instructions\n\n` +
                `<i>Enjoy your learning session! 🌟</i>\n\n` +
                `<i>Session starts when 3 members join!</i>`;

            await this.bot.telegram.sendMessage(groupId, moderationMessage, {
                parse_mode: 'HTML'
            });
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
            const totalMemberCount = await this.getChatMemberCount(groupId);

            console.log(`Checking activeGroups for groupId: ${groupId}`);
            const actualParticipantCount = totalMemberCount - 2;

            console.log("Type of groupId:", typeof groupId);

            // Log all active groups for debugging
            console.log("Current active groups from line 191:", Array.from(this.activeGroups.entries()));

            // Ensure consistent `groupId` type
            const normalizedGroupId = String(groupId);
            const group = this.activeGroups.get(normalizedGroupId);

            if (group) {
                console.log("Detail group information from monitor group in line 198:", group);
            } else {
                console.log(`No group found for the given groupId (${normalizedGroupId}).`);
                return;
            }
            // Check if the actual participant count is less than 2
            // Check if the actual participant count is less than 2
            if (actualParticipantCount < 2) {
                console.log(`Not enough participants for group ${groupId}. Starting the end session countdown.`);

                // Notify users about the insufficient participant count
                await this.bot.telegram.sendMessage(groupId,
                    `🚨 Not enough participants to continue the session.\n` +
                    `👥 Minimum required: 2 participants.\n` +
                    `⏳ The session will end in 2 minutes unless more members join.`
                );

                // Start a timer for 1 minute to send a reminder
                setTimeout(async () => {
                    console.log(`1-minute warning sent for group ${groupId}.`);
                    await this.bot.telegram.sendMessage(groupId,
                        `⚠️ Still not enough participants in the session.\n` +
                        `⏳ The session will end in 1 minute unless more members join.`
                    );

                    // Start another timer for the final session end
                    setTimeout(async () => {
                        console.log(`Final check before ending the session for group ${groupId}.`);
                        const admins = await this.bot.telegram.getChatAdministrators(groupId);
                        const userIds = admins.filter(admin => !admin.user.is_bot).map(admin => admin.user.id);

                        // Check the participant count again (optional if you want real-time updates)
                        const updatedMemberCount = await this.getChatMemberCount(groupId);
                        const updatedParticipantCount = updatedMemberCount - 2;

                        if (updatedParticipantCount < 2) {
                            console.log(`Ending session for group ${groupId} due to insufficient participants.`);
                            await this.bot.telegram.sendMessage(groupId,
                                `🚨 Time's up! The session is ending now due to insufficient participants.\n` +
                                `👥 Please try again when more members are available.`
                            );

                            // End the session
                            await this.endSession(groupId, userIds);
                        } else {
                            console.log(`Participants joined. Session will not end for group ${groupId}.`);
                            await this.bot.telegram.sendMessage(groupId,
                                `✅ More participants have joined! The session will continue as planned. 🎉`
                            );
                        }
                    }, 1 * 60 * 1000); // Final check after 1 minute
                }, 2 * 60 * 1000); // First reminder after 1 minute

                return; // Exit to avoid proceeding with other logic
            }

            // Check if we have enough participants (3 or more)
            if (actualParticipantCount >= 2) {
                // Notify users we have enough participants and can start a voice chat
                await this.bot.telegram.sendMessage(groupId,
                    `🎉 Awesome! We have enough participants! 🌟\n\n` +
                    `🎯 Let’s level up those speaking skills! Just follow these steps to get started:\n` +
                    `1️⃣ Tap the group name at the top of your screen.\n` +
                    `2️⃣ Hit the three dots (⋮) menu.\n` +
                    `3️⃣ Pick “Start Voice Chat” and let the fun begin!\n\n` +
                    `💡 Quick Tips:\n` +
                    `• No need to be shy—we’re all here to learn!\n` +
                    `• Mistakes are welcome—they help us grow.\n` +
                    `• Be kind and cheer each other on!\n\n` +
                    `⚠️ Make sure to start the voice chat within 5 minutes, or the session will wrap up automatically.\n\n` +
                    `Let’s make it count! 💪`,
                    { parse_mode: 'HTML' }
                );

                // Start a 5-minute timer to check for voice chat initiation
                setTimeout(async () => {
                    console.log(`5-minute timer expired for group ${groupId}. Checking voice chat status.`);
                    // Ensure consistent `groupId` type
                    const normalizedGroupId = String(groupId);
                    const currentGroup = this.activeGroups.get(normalizedGroupId);
                    console.log("current group status data in line 209 :", group);

                    // Check if the voice chat has started
                    if (currentGroup && currentGroup.voiceChatStarted) {
                        console.log(`Voice chat has started for group ${groupId}. No action needed.`);
                        return; // Exit if the voice chat has started
                    }

                    console.log(`No voice chat started yet for group ${groupId}. Sending final reminder.`);
                    // Send the first warning message (final reminder)
                    await this.bot.telegram.sendMessage(groupId,
                        `⚠️ No voice chat started yet! The session will end in 1 minute if no action is taken.`
                    );

                    // Start a 1-minute timer before ending the session
                    setTimeout(async () => {
                        console.log(`1-minute timer expired for group. Final check before session end.`);
                        const normalizedGroupId = String(groupId);
                        const updatedGroup = this.activeGroups.get(normalizedGroupId);
                        console.log("Updated group status data:", updatedGroup); // Log updated group status

                        if (updatedGroup && !updatedGroup.voiceChatStarted) {
                            console.log(`No voice chat started for group. Ending session.`);
                            // Final message and session end
                            await this.bot.telegram.sendMessage(groupId,
                                `🚨 Time's up! No voice chat started. The session is now ending.`
                            );

                            // End the session
                            const admins = await this.bot.telegram.getChatAdministrators(groupId);
                            const userIds = admins.filter(admin => !admin.user.is_bot).map(admin => admin.user.id);
                            await this.endSession(groupId, userIds);
                        } else {
                            console.log(`Voice chat has started or group not found. No action taken.`);
                        }
                    }, 1 * 60 * 1000); // 30-second delay for final message
                }, 2 * 60 * 1000); // 5-minute initial timer
            }

        } catch (error) {
            console.error('Error monitoring group members:', error);
        }
    }

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
        const warningTimes = [4, 3, 2]; // minutes before end
        const duration = 5 * 60 * 1000;

        // console.log(`Starting voice chat timer for group ${groupId}`);
        // console.log(`Session duration: ${duration} minutes`);

        warningTimes.forEach(minutes => {
            setTimeout(async () => {
                if (this.activeGroups.has(groupId)) {
                    // console.log(`⚠️ ${minutes} minute(s) remaining for voice chat in group ${groupId}`);
                    await this.bot.telegram.sendMessage(groupId,
                        `⚠️ ${minutes} minute${minutes > 1 ? 's' : ''} remaining!`,
                        { parse_mode: 'HTML' }
                    );
                }
            }, duration - (minutes * 60 * 1000));
        });

        // End timer
        setTimeout(async () => {
            if (this.activeGroups.has(groupId)) {
                // console.log(`🔚 Voice chat time is up for group ${groupId}`);
                await this.bot.telegram.sendMessage(groupId,
                    `🔚 Session time is up! Thank you for participating.`,
                    { parse_mode: 'HTML' }
                );
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
    async endSession(groupId, userIds) {
        userIds = [87654321, 12345678];
        console.log(`Ending session for group ${groupId} and user ${userIds}`);
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // First get the group_id from TelegramGroups using telegram_chat_id
            const [telegramGroup] = await connection.query(
                'SELECT group_id FROM TelegramGroups WHERE telegram_chat_id = ?',
                [groupId.toString()]
            );

            if (telegramGroup.length === 0) {
                throw new Error('Telegram group not found');
            }

            const internalGroupId = telegramGroup[0].group_id;

            // Get the session ID from LiveSessions
            const [liveSession] = await connection.query(
                `SELECT session_id FROM LiveSessions 
                WHERE telegram_chat_id = ? 
                AND status != 'Ended' 
                ORDER BY created_at DESC 
                LIMIT 1`,
                [groupId.toString()]
            );

            if (liveSession.length === 0) {
                throw new Error('Active session not found');
            }

            const sessionId = liveSession[0].session_id;

            // Stop live video chat if running
            // try {
            //     await this.bot.telegram.stopVideoChat(groupId);
            //     console.log('Live video chat stopped successfully.');
            // } catch (error) {
            //     console.error('Error stopping live video chat:', error);
            // }

            // Update database tables
            await Promise.all([
                connection.query(
                    `UPDATE LiveSessions 
                    SET status = 'Scheduled',
                        current_participants = 0,
                        updated_at = CURRENT_TIMESTAMP 
                    WHERE telegram_chat_id = ? 
                    AND status != 'Ended'`,
                    [groupId.toString()]
                ),
                connection.query(
                    `UPDATE TelegramGroups 
                    SET status = 'available', 
                        updated_at = CURRENT_TIMESTAMP,
                        last_used_at = CURRENT_TIMESTAMP 
                    WHERE telegram_chat_id = ?`,
                    [groupId.toString()]
                ),
                // connection.query(
                //     `UPDATE LiveSessionParticipants 
                //     SET status = 'completed',
                //         completed_at = CURRENT_TIMESTAMP
                //     WHERE session_id = ? 
                //     AND user_id IN (?)`,  // Use IN clause for multiple user IDs
                //     [sessionId, userIds]
                // )
            ]);

            await connection.commit();

            // Send end session message to the group
            await this.bot.telegram.sendMessage(groupId,
                `🔚 <b>Session Ended</b>\n\n` +
                `Thank you for participating in this language practice session!\n` +
                `The group will be reset for the next session.`,
                { parse_mode: 'HTML' }
            );

            // Remove all members except bot and owner
            await this.removeAllMembers(groupId);

            // Reset group title and description
            try {
                await this.bot.telegram.setChatTitle(groupId, `Language Practice Group`);
                await this.bot.telegram.setChatDescription(groupId,
                    `This group is available for new language practice sessions.`
                );
            } catch (error) {
                console.error('Error resetting group details:', error);
            }
            const normalizedGroupId = String(groupId);
            // Remove from active groups
            this.activeGroups.delete(normalizedGroupId);

            return {
                success: true,
                message: 'Session ended and group reset successfully'
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error ending session in GroupManager:', error);
            throw new Error(`Failed to end session: ${error.message}`);
        } finally {
            connection.release();
        }
    }
    async monitorVoiceChatStatus(groupId) {
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
                            `Session timer has begun. Enjoy your practice!`
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

    async startActiveSessionTimer(groupId) {
        const duration = 60 * 60 * 1000; // 1 hour
        console.log(`Starting active session timer for group ${groupId}`);

        // Periodic updates
        setInterval(async () => {
            if (this.activeGroups.has(groupId)) {
                await this.bot.telegram.sendMessage(groupId,
                    `⏰ 15 minutes passed—how is everyone doing?`
                );
            }
        }, 15 * 60 * 1000); // 15 minutes

        // End session after duration
        setTimeout(async () => {
            await this.endSession(groupId, []);
        }, duration);
    }
}

module.exports = GroupManager;
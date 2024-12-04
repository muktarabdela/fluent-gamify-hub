const config = require('./config'); // Adjust path as needed
const { getPool } = require('../config/db');

class GroupManager {
    constructor(bot) {
        this.bot = bot;
        this.activeGroups = new Map();
    }

    async prepareGroup(groupId) {
        console.log('Preparing group with ID:', groupId);
        try {
            console.log('Preparing group with ID:', groupId);

            if (!groupId) {
                throw new Error('Group ID is required');
            }

            // Ensure groupId is a string and has the correct format
            const formattedGroupId = String(groupId).startsWith('-') ? groupId : `-${groupId}`;

            console.log('Checking bot membership for group:', formattedGroupId);

            try {
                // First verify the chat exists and bot can access it
                const chat = await this.bot.telegram.getChat(formattedGroupId);
                console.log('Chat found:', chat.title);

                const chatMember = await this.bot.telegram.getChatMember(formattedGroupId, this.bot.botInfo.id);
                console.log('Bot status in group:', chatMember.status);

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

    async createTemporarySession(sessionTopic, groupId) {
        console.log('Creating temporary session for group:', groupId, 'with topic:', sessionTopic);
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

            // Start monitoring voice chat status for this group
            await this.monitorVoiceChatStatus(preparedGroupId);
            console.log('Voice chat monitoring started for group:', preparedGroupId);

            // Store session info
            const sessionInfo = {
                inviteId: inviteLink.invite_link_id,
                topic: sessionTopic,
                createdAt: Date.now(),
                memberCount: 0,
                isActive: true,
                sessionStarted: true,
                voiceChatStarted: false  // Add this flag
            };
            this.activeGroups.set(inviteLink.invite_link_id, sessionInfo);

            // Send welcome messages
            await this.sendSessionWelcomeMessages(preparedGroupId, sessionTopic);

            return {
                groupId: preparedGroupId,
                inviteLink: inviteLink.invite_link
            };
        } catch (error) {
            console.error('Error creating session:', error);
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }

    async sendSessionWelcomeMessages(groupId, topic) {
        try {
            const welcomeMessage =
                `🎉 <b>Welcome to the Live Language Session!</b>\n\n` +
                `📚 <b>Topic:</b> ${topic}\n` +
                `⏰ <b>Duration:</b> 3 minutes\n\n` +
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
                `<i>Enjoy your learning session! 🌟</i>`;

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
            console.log(`Member count for group ${groupId}:`, count);
            return count;
        } catch (error) {
            console.error('Error getting member count:', error);
            return 0;
        }
    }

    async monitorGroupMembers(groupId) {
        try {
            const totalMemberCount = await this.getChatMemberCount(groupId);
            // Subtract 2 from total count (bot and group owner)
            const actualParticipantCount = totalMemberCount - 2;

            console.log(`Monitoring group ${groupId}:`);
            console.log(`- Total members: ${totalMemberCount}`);
            console.log(`- Actual participants: ${actualParticipantCount}`);

            const group = this.activeGroups.get(groupId);
            
            // Check if we have enough participants (3 or more)
            if (actualParticipantCount >= 3) {
                if (!group?.countdownStarted) {
                    await this.bot.telegram.sendMessage(groupId,
                        `🎉 Fantastic! We've got our language practice squad assembled! 🌟\n\n` +
                        `🎯 Ready to level up your speaking skills? Here's how to jump in:\n` +
                        `1️⃣ Tap the group name at the top of your screen\n` +
                        `2️⃣ Hit the magical three dots ⋮ menu\n` +
                        `3️⃣ Choose "Start Voice Chat" to begin the fun!\n\n` +
                        `💡 Quick Tips:\n` +
                        `• Don't be shy - everyone's here to learn!\n` +
                        `• Make mistakes freely - that's how we improve\n` +
                        `• Support each other with positive feedback\n\n` +
                        `⚠️ Please start the voice chat within 5 minutes, or the session will end automatically!\n\n` +
                        `Let's make every minute count! 💪`,
                        { parse_mode: 'HTML' }
                    );

                    // Start 5-minute timer for voice chat to begin
                    setTimeout(async () => {
                        const currentGroup = this.activeGroups.get(groupId);
                        if (currentGroup && !currentGroup.voiceChatStarted) {
                            await this.bot.telegram.sendMessage(groupId,
                                `⚠️ Session ending due to no voice chat started within 5 minutes.`
                            );
                            // Get admin users for endSession
                            const admins = await this.bot.telegram.getChatAdministrators(groupId);
                            const userIds = admins
                                .filter(admin => !admin.user.is_bot)
                                .map(admin => admin.user.id);
                            await this.endSession(groupId, userIds);
                        }
                    }, 5 * 60 * 1000); // 5 minutes

                    if (group) {
                        group.countdownStarted = true;
                    }
                }
            } else {
                // If we don't have enough participants after 5 minutes, end the session
                if (!group?.waitingForParticipants) {
                    if (group) group.waitingForParticipants = true;
                    
                    await this.bot.telegram.sendMessage(groupId,
                        `⏳ Waiting for more participants to join...\n` +
                        `We need at least 3 participants to start.\n` +
                        `Current participants: ${actualParticipantCount}\n` +
                        `Session will end in 5 minutes if we don't have enough participants.`
                    );

                    setTimeout(async () => {
                        const currentCount = await this.getChatMemberCount(groupId);
                        const actualCurrentCount = currentCount - 2;
                        if (actualCurrentCount < 3) {
                            await this.bot.telegram.sendMessage(groupId,
                                `⚠️ Session ending due to insufficient participants.`
                            );
                            const admins = await this.bot.telegram.getChatAdministrators(groupId);
                            const userIds = admins
                                .filter(admin => !admin.user.is_bot)
                                .map(admin => admin.user.id);
                            await this.endSession(groupId, userIds);
                        }
                    }, 5 * 60 * 1000); // 5 minutes
                }
            }
        } catch (error) {
            console.error('Error monitoring group members:', error);
        }
    }

    async startSessionCountdown(groupId) {
        console.log(`Starting countdown for group ${groupId}`);

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
        }, config.SESSION_DURATION_MINUTES * 60 * 1000);
    }

    async startVoiceChatTimer(groupId) {
        const warningTimes = [15, 5, 1]; // minutes before end
        const duration = config.SESSION_DURATION_MINUTES * 60 * 1000;

        console.log(`Starting voice chat timer for group ${groupId}`);
        console.log(`Session duration: ${config.SESSION_DURATION_MINUTES} minutes`);

        warningTimes.forEach(minutes => {
            setTimeout(async () => {
                if (this.activeGroups.has(groupId)) {
                    console.log(`⚠️ ${minutes} minute(s) remaining for voice chat in group ${groupId}`);
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
                console.log(`🔚 Voice chat time is up for group ${groupId}`);
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

            console.log(`New members joined group ${chatId}:`);
            console.log(`- Current total members: ${memberCount}`);
            console.log(`- New members joining: ${newMembers.length}`);

            for (const member of newMembers) {
                if (member.id === botId) {
                    console.log(`- Skipping bot (${member.id})`);
                    continue;
                }

                console.log(`- Promoting user ${member.id} (${member.first_name}) to admin`);
                try {
                    await this.bot.telegram.promoteChatMember(chatId, member.id, {
                        can_manage_chat: true,
                        can_manage_video_chats: true,
                        can_delete_messages: true,
                        can_restrict_members: true,
                        can_invite_users: true,
                        can_pin_messages: true
                    });

                    console.log(`Successfully promoted ${member.first_name} to admin`);

                    // Send confirmation message
                    await this.bot.telegram.sendMessage(chatId,
                        `Welcome ${member.first_name}! 🎉\n` +
                        `You've been promoted to admin for this session.`,
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

            this.activeGroups.delete(groupId);
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
                connection.query(
                    `UPDATE LiveSessionParticipants 
                    SET status = 'completed',
                        completed_at = CURRENT_TIMESTAMP
                    WHERE session_id = ? 
                    AND user_id IN (?)`,  // Use IN clause for multiple user IDs
                    [sessionId, userIds]
                )
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

            // Remove from active groups
            this.activeGroups.delete(groupId);

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
            console.log('Setting up voice chat monitoring for group:', groupId);

            // Listen for voice chat started
            this.bot.on('video_chat_started', async (ctx) => {
                console.log('Video chat event received:', ctx.chat.id, groupId);
                if (ctx.chat.id.toString() === groupId.toString()) {
                    console.log(`🎥 Voice/Video chat started in group ${groupId}`);
                    console.log('Chat title:', ctx.chat.title);
                    console.log('Started by user:', ctx.from?.first_name);

                    const totalMembers = await this.getChatMemberCount(groupId);
                    const actualParticipants = totalMembers - 2;

                    if (actualParticipants >= 3) {
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
}

module.exports = GroupManager;
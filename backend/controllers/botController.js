const { bot, groupManager } = require('../bot/bot');
const { LiveSession, TelegramGroup } = require('../model/model');

const botController = {
    createNewSession: async (req, res) => {
        const { topic, group_id, duration, sessionId } = req.body;
        if (!group_id) {
            throw new Error('group_id is required');
        }
        try {
            console.log('Duration from bot controller:', duration);
            // Create a temporary session using GroupManager
            const sessionResult = await groupManager.createTemporarySession(
                topic,                  // The topic of the session
                group_id.toString(),    // The group ID as a string
                duration                // The session duration
            );

            console.log('Session created successfully:', sessionResult);


            // if (!sessionResult || !sessionResult.inviteLink) {
            //     // Check if the group exists in TelegramGroups collection
            //     let existingGroup = await TelegramGroup.findOne({ telegram_chat_id: group_id.toString() });
            //     let groupId;

            //     if (!existingGroup) {
            //         // Insert a new group if it doesn't exist
            //         const newGroup = await TelegramGroup.create({
            //             telegram_chat_id: group_id.toString(),
            //             status: 'in_use',
            //             last_used_at: new Date(),
            //             updated_at: new Date(),
            //         });
            //         groupId = newGroup._id; // Use the MongoDB ObjectId
            //     } else {
            //         // Update the existing group's status
            //         groupId = existingGroup._id; // Use the MongoDB ObjectId
            //         existingGroup.status = 'in_use';
            //         existingGroup.last_used_at = new Date();
            //         existingGroup.updated_at = new Date();
            //         await existingGroup.save();
            //     }
            // }


            if (!sessionResult || !sessionResult.inviteLink) {
                throw new Error('Failed to create a temporary session');
            }

            // Update the TelegramGroup status after successfully creating the session
            await TelegramGroup.updateOne(
                { telegram_chat_id: group_id.toString() },
                {
                    $set: {
                        status: 'in_use',
                        last_used_at: new Date(),
                        updated_at: new Date(),
                    },
                }
            );

            // Check if a LiveSession already exists for the group
            let liveSession = await LiveSession.findOne({ _id: sessionId });
            console.log(liveSession)
            if (liveSession) {
                // Update the existing LiveSession
                await LiveSession.updateOne(
                    { _id: sessionId },
                    {
                        $set: {
                            status: 'Ongoing',
                            inviteLink: sessionResult.inviteLink,
                            updated_at: new Date(),
                        },
                        $inc: { current_participants: 1 }, // Increment participants by 1
                    }
                );
            } else {
                // Create a new LiveSession if it doesn't exist
                liveSession = new LiveSession({
                    telegram_chat_id: group_id.toString(),
                    status: 'Ongoing',
                    inviteLink: sessionResult.inviteLink,
                    current_participants: 1,
                    duration: duration,
                    start_time: new Date(),
                    level: 'Beginner',       // Default value; adjust as needed
                    topic: topic,            // Set from request body
                    session_type: 'free_talk', // Default or dynamic value
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                await liveSession.save();
            }

            // Send response
            res.json({
                success: true,
                inviteLink: sessionResult.inviteLink,
                notificationSent: true,
                groupId: sessionResult.groupId,
            });

        } catch (error) {
            console.error('Error creating session:', error);

            let errorMessage = error.message;
            if (error.message.includes('chat not found')) {
                errorMessage = 'The specified group was not found. Please ensure the group exists and the bot is a member of it.';
            }

            res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    },



    // End session
    endSession: async (req, res) => {
        try {
            const { group_id, userId } = req.body;

            if (!group_id) {
                return res.status(400).json({
                    success: false,
                    message: 'group_id is required'
                });
            }

            // Find the group
            const telegramGroup = await TelegramGroup.findOne({ telegram_chat_id: group_id.toString() });
            if (!telegramGroup) {
                throw new Error('Telegram group not found');
            }

            // Find the live session
            const liveSession = await LiveSession.findOne({
                telegram_chat_id: group_id.toString(),
                status: { $ne: 'Ended' }
            }).sort({ created_at: -1 });

            if (!liveSession) {
                throw new Error('Active session not found');
            }

            // Update the live session status
            liveSession.status = 'Scheduled';
            await liveSession.save();

            // Update the Telegram group status
            telegramGroup.status = 'available';
            await telegramGroup.save();

            res.json({
                success: true,
                message: 'Session ended successfully',
                liveSessionsUpdated: 1, // Assuming one session is updated
                telegramGroupsUpdated: 1 // Assuming one group is updated
            });
        } catch (error) {
            console.error('Error ending session:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to end session'
            });
        }
    }
};

module.exports = botController;

import instance from "./axios";

export const createNewSession = async ({ topic, lessonId = null, group_id, sessionId, duration }) => {
    console.log("group id from bot servies", group_id)
    try {
        const response = await instance.post('/bot/newsession', {
            topic,
            lessonId,
            group_id,
            sessionId,
            duration
        }, {
            timeout: 40000
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to create session');
        }

        return {
            inviteLink: response.data.inviteLink,
            notificationSent: response.data.notificationSent
        };
    } catch (error) {
        console.error('Error creating new session:', error);
        throw error;
    }
};

// Additional bot-related API calls can be added here as needed 
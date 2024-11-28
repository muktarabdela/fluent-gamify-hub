import instance from "./axios";

// Get all live sessions with optional filters
export const getAllLiveSessions = async (filters = {}) => {
    try {
        const response = await instance.get('/live-sessions', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching live sessions:', error);
        throw error;
    }
};

// Get sessions by type (lesson or free_talk)
export const getSessionsByType = async (sessionType, status = null, userId = null) => {
    try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (userId) params.append('userId', userId);

        const response = await instance.get(`/live-sessions/type/${sessionType}?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching sessions by type:', error);
        throw error;
    }
};

// Get session by ID
export const getSessionById = async (sessionId) => {
    try {
        const response = await instance.get(`/live-sessions/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching session:', error);
        throw error;
    }
};

// Get user's sessions
export const getUserSessions = async (userId) => {
    try {
        const response = await instance.get(`/live-sessions/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        throw error;
    }
};

// Create new session or get existing one
export const createSession = async (sessionData) => {
    try {
        const response = await instance.post('/live-sessions', sessionData);
        return {
            ...response.data,
            isExisting: response.data.isExisting || false
        };
    } catch (error) {
        console.error('Error creating/getting session:', error);
        throw error;
    }
};

// Update session
export const updateSession = async (sessionId, sessionData) => {
    try {
        const response = await instance.put(`/live-sessions/${sessionId}`, sessionData);
        return response.data;
    } catch (error) {
        console.error('Error updating session:', error);
        throw error;
    }
};

// Delete session
export const deleteSession = async (sessionId) => {
    try {
        const response = await instance.delete(`/live-sessions/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting session:', error);
        throw error;
    }
};

// Join session
export const joinSession = async (sessionId, userId) => {
    try {
        const response = await instance.post(`/live-sessions/${sessionId}/join`, { userId });
        return response.data;
    } catch (error) {
        if (error.response?.status === 403) {
            throw new Error('You must complete the lesson before joining this session');
        }
        console.error('Error joining session:', error);
        throw error;
    }
};

// Leave session
export const leaveSession = async (sessionId, userId) => {
    try {
        const response = await instance.post(`/live-sessions/${sessionId}/leave`, { userId });
        return response.data;
    } catch (error) {
        console.error('Error leaving session:', error);
        throw error;
    }
};

// Update session status
export const updateSessionStatus = async (sessionId, status, inviteLink = null) => {
    try {
        const response = await instance.patch(`/live-sessions/${sessionId}/status`, { status, inviteLink });
        return response.data;
    } catch (error) {
        console.error('Error updating session status:', error);
        throw error;
    }
}; 
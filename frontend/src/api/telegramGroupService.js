import instance from "./axios";

export const getAllGroups = async () => {
    try {
        const response = await instance.get('/telegram-groups');
        return response.data;
    } catch (error) {
        console.error('Error fetching telegram groups:', error);
        throw error;
    }
};

export const getAvailableGroup = async () => {
    try {
        const response = await instance.get('/telegram-groups/available');
        return response.data;
    } catch (error) {
        console.error('Error fetching available telegram group:', error);
        throw error;
    }
};

export const getGroupById = async (groupId) => {
    try {
        const response = await instance.get(`/telegram-groups/${groupId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching telegram group:', error);
        throw error;
    }
};

export const createGroup = async (groupData) => {
    try {
        const response = await instance.post('/telegram-groups', groupData);
        return response.data;
    } catch (error) {
        console.error('Error creating telegram group:', error);
        throw error;
    }
};

export const updateGroup = async (groupId, groupData) => {
    try {
        const response = await instance.put(`/telegram-groups/${groupId}`, groupData);
        return response.data;
    } catch (error) {
        console.error('Error updating telegram group:', error);
        throw error;
    }
};

export const deleteGroup = async (groupId) => {
    try {
        const response = await instance.delete(`/telegram-groups/${groupId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting telegram group:', error);
        throw error;
    }
}; 
import instance from "./axios";

export const getDialoguesByLesson = async (lessonId) => {
    try {
        const response = await instance.get(`/dialogues/lesson/${lessonId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dialogues:', error);
        throw error;
    }
};

export const createDialogue = async (dialogueData) => {
    try {
        const response = await instance.post(`/dialogues`, dialogueData);
        return response.data;
    } catch (error) {
        console.error('Error creating dialogue:', error);
        throw error;
    }
};

export const createBulkDialogues = async (dialoguesData) => {
    try {
        const response = await instance.post(`/dialogues/bulk`, dialoguesData);
        return response.data;
    } catch (error) {
        console.error('Error creating bulk dialogues:', error);
        throw error;
    }
}; 
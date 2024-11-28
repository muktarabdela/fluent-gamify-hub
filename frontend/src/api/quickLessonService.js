import instance from './axios';

export const getQuickLessonByLessonId = async (lessonId) => {
    try {
        const response = await instance.get(`/quick-lessons/lesson/${lessonId}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error('Error fetching quick lesson:', error);
        throw error;
    }
};

export const createQuickLesson = async (quickLessonData) => {
    try {
        const response = await instance.post('/quick-lessons', quickLessonData);
        return response.data;
    } catch (error) {
        console.error('Error creating quick lesson:', error);
        throw error;
    }
};

export const updateQuickLesson = async (quickLessonId, quickLessonData) => {
    try {
        const response = await instance.put(`/quick-lessons/${quickLessonId}`, quickLessonData);
        return response.data;
    } catch (error) {
        console.error('Error updating quick lesson:', error);
        throw error;
    }
};

export const deleteQuickLesson = async (quickLessonId) => {
    try {
        const response = await instance.delete(`/quick-lessons/${quickLessonId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting quick lesson:', error);
        throw error;
    }
}; 
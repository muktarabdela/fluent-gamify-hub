import instance from './axios';

// Topic Management
export const createExercise = async (exerciseData) => {
    const response = await instance.post('/practice/exercises', {
        typeId: exerciseData.typeId,
        topicId: exerciseData.topicId,
        content: exerciseData.content
    });
    return response.data;
};

export const getPracticeTopics = async () => {
    const response = await instance.get('/practice/topics');
    return response.data;
};
export const getCategories = async () => {
    const response = await instance.get('/practice/categories');
    return response.data;
};

export const getFilteredExercises = async (categoryId, topicId) => {
    console.log(categoryId, topicId)
    const params = {
        categoryId,
        topicId
    };
    const response = await instance.get('/practice/filtered', { params });
    return response.data;
};
export const getExerciseById = async (id) => {
    const response = await instance.get(`/practice/exercises/${id}`);
    return response.data;
};

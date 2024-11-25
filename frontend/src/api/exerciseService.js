import instance from "./axios";

// Get all exercises for a lesson
export const getExercisesByLesson = async (lessonId, userId) => {
    try {
        const response = await instance.get(`/exercises/lesson/${lessonId}`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching exercises:', error);
        throw error;
    }
};

// Get specific exercise by ID
export const getExerciseById = async (exerciseId) => {
    try {
        const response = await instance.get(`/exercises/${exerciseId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching exercise:', error);
        throw error;
    }
};

// Create new exercise
export const createExercise = async (exerciseData) => {
    try {
        const response = await instance.post('/exercises', exerciseData);
        return response.data;
    } catch (error) {
        console.error('Error creating exercise:', error);
        throw error;
    }
};

// Update exercise
export const updateExercise = async (exerciseId, exerciseData) => {
    try {
        const response = await instance.put(`/exercises/${exerciseId}`, exerciseData);
        return response.data;
    } catch (error) {
        console.error('Error updating exercise:', error);
        throw error;
    }
};

// Delete exercise
export const deleteExercise = async (exerciseId) => {
    try {
        const response = await instance.delete(`/exercises/${exerciseId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting exercise:', error);
        throw error;
    }
};

// Submit exercise answer
export const submitExerciseAnswer = async (exerciseId, userId, answer) => {
    try {
        const response = await instance.post(`/exercises/${exerciseId}/submit`, {
            userId,
            answer
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting exercise answer:', error);
        throw error;
    }
}; 
import axios from './axios';

export const getExercisesByLesson = async (lessonId) => {
  try {
    const response = await axios.get(`/exercises/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const checkAnswer = async (exerciseId, userAnswer) => {
  try {
    const response = await axios.post(`/exercises/${exerciseId}/check`, {
      answer: userAnswer
    });
    return response.data;
  } catch (error) {
    console.error('Error checking answer:', error);
    throw error;
  }
};

export const startLesson = async (lessonId) => {
  try {
    const response = await axios.post(`/exercises/lesson/${lessonId}/start`);
    return response.data;
  } catch (error) {
    console.error('Error starting lesson:', error);
    throw error;
  }
}; 
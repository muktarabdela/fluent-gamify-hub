import instance from "./axios";

export const getLessonsByUnit = async (unitId) => {
  console.log("unitId", unitId);
  try {
    const response = await instance.get(`/lessons/unit/${unitId}`);
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

export const getLessonById = async (lessonId) => {
  try {
    const response = await instance.get(`/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

export const createLesson = async (lessonData) => {
  try {
    const response = await instance.post('/lessons', lessonData);
    return response.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const updateLesson = async (lessonId, lessonData) => {
  try {
    const response = await instance.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const response = await instance.delete(`/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}; 
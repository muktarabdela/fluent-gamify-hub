import instance from "./axios";

export const createOrUpdateUser = async (userData) => {
  try {
    const response = await instance.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await instance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const response = await instance.put(`/users/${userId}/preferences`, { preferences });
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await instance.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUserProgress = async (userId) => {
  try {
    const response = await instance.get(`/users/${userId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (userId, progressData) => {
  try {
    const response = await instance.post(`/users/${userId}/progress`, progressData);
    return response.data;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

export const getUserStreak = async (userId) => {
  try {
    const response = await instance.get(`/users/${userId}/streak`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user streak:', error);
    throw error;
  }
};

export const updateUserStreak = async (userId) => {
  try {
    const response = await instance.put(`/users/${userId}/streak`);
    return response.data;
  } catch (error) {
    console.error('Error updating user streak:', error);
    throw error;
  }
}; 
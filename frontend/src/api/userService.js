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
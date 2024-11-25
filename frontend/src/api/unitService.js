import instance from "./axios";
export const getAllUnits = async () => {
  try {
    const response = await instance.get('/units');
    // console.log("response", response);
    return response.data;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

export const getUnitById = async (unitId) => {
  try {
    const response = await instance.get(`/units/${unitId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unit:', error);
    throw error;
  }
};

export const createUnit = async (unitData) => {
  try {
    const response = await instance.post('/units', unitData);
    return response.data;
  } catch (error) {
    console.error('Error creating unit:', error);
    throw error;
  }
};

export const updateUnit = async (unitId, unitData) => {
  try {
    const response = await instance.put(`/units/${unitId}`, unitData);
    return response.data;
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

export const deleteUnit = async (unitId) => {
  try {
    const response = await instance.delete(`/units/${unitId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
}; 
import instance from "./axios";

export const getAllUnits = async () => {
  const response = await instance.get('/units');
  return response.data;
};

export const getUnitById = async (id) => {
  const response = await instance.get(`/units/${id}`);
  return response.data;
};

export const createUnit = async (unitData) => {
  const response = await instance.post('/units', unitData);
  return response.data;
};

export const updateUnit = async (id, unitData) => {
  const response = await instance.put(`/units/${id}`, unitData);
  return response.data;
};

export const deleteUnit = async (id) => {
  const response = await instance.delete(`/units/${id}`);
  return response.data;
}; 
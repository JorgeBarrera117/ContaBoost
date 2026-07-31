import { apiClient } from './client';

export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await apiClient.post('/users', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: any) => {
  const response = await apiClient.put(`/users/${id}`, userData);
  return response.data;
};

export const updateUserStatus = async (id: number, activo: boolean) => {
  const response = await apiClient.put(`/users/${id}/status`, { activo });
  return response.data;
};

export const getUserActivity = async (id: number) => {
  const response = await apiClient.get(`/users/${id}/activity`);
  return response.data;
};

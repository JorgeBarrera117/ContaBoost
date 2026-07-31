import { apiClient } from './client';

export const updatePassword = async (password: string) => {
  const response = await apiClient.put('/auth/me/password', { password });
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

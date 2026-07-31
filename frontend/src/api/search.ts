import { apiClient } from './client';

export const globalSearch = async (query: string) => {
  if (!query || query.length < 2) return [];
  const response = await apiClient.get(`/dashboard/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

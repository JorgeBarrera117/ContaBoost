import { apiClient } from './client';

export const getDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/summary');
  return response.data;
};

export const getEmployeeDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/employee-summary');
  return response.data;
};

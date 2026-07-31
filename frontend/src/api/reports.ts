import { apiClient } from './client';

export const getTrialBalance = async (startDate?: string, endDate?: string) => {
  let url = '/reports/trial-balance';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await apiClient.get(url);
  return response.data;
};

export const getProfitAndLoss = async (startDate?: string, endDate?: string) => {
  let url = '/reports/profit-loss';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await apiClient.get(url);
  return response.data;
};

export const getBalanceSheet = async (endDate?: string) => {
  let url = '/reports/balance-sheet';
  if (endDate) {
    url += `?endDate=${endDate}`;
  }
  const response = await apiClient.get(url);
  return response.data;
};

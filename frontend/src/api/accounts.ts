import { apiClient } from './client';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDto {
  code: string;
  name: string;
  type: string;
}

export const getAccounts = async (): Promise<Account[]> => {
  const response = await apiClient.get('/accounts');
  return response.data;
};

export const createAccount = async (data: CreateAccountDto): Promise<Account> => {
  const response = await apiClient.post('/accounts', data);
  return response.data;
};

export const seedEcuadorAccounts = async (): Promise<{inserted: number}> => {
  const response = await apiClient.post('/accounts/seed-ecuador');
  return response.data;
};

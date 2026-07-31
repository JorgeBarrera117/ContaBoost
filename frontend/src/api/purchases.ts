import { apiClient } from './client';

export interface CreatePurchaseDto {
  contactId: string;
  purchaseNumber: string;
  lines: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
}

export const createPurchase = async (data: CreatePurchaseDto) => {
  const response = await apiClient.post('/purchases', data);
  return response.data;
};

export const getPurchases = async () => {
  const response = await apiClient.get('/purchases');
  return response.data;
};

import { apiClient } from './client';

export interface CreateInvoiceDto {
  contactId: string;
  establishmentCode: string;
  emissionPointCode: string;
  paymentMethod?: string;
  lines: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export const seedBilling = async () => {
  const response = await apiClient.post('/invoices/seed-billing');
  return response.data;
};

export const createInvoice = async (data: CreateInvoiceDto) => {
  const response = await apiClient.post('/invoices', data);
  return response.data;
};

export const getInvoices = async () => {
  const response = await apiClient.get('/invoices');
  return response.data;
};

 

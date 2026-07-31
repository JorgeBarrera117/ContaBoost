import { apiClient } from './client';

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  cost: number;
  price: number;
  hasIva: boolean;
  stock?: number;
}

export const getProducts = async () => {
  const response = await apiClient.get('/products');
  return response.data;
};

export const getNextSku = async () => {
  const response = await apiClient.get('/products/sku/next');
  return response.data.sku;
};

export const createProduct = async (data: CreateProductDto) => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async ({ id, data }: { id: string; data: CreateProductDto }) => {
  const response = await apiClient.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

export const seedWarehouse = async () => {
  const response = await apiClient.post('/products/seed-warehouse');
  return response.data;
};

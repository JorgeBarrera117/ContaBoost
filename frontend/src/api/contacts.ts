import { apiClient } from './client';

export interface CreateContactDto {
  identification: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const getContacts = async () => {
  const response = await apiClient.get('/contacts');
  return response.data;
};

export const createContact = async (data: CreateContactDto) => {
  const response = await apiClient.post('/contacts', data);
  return response.data;
};

export const updateContact = async ({ id, data }: { id: string; data: CreateContactDto }) => {
  const response = await apiClient.patch(`/contacts/${id}`, data);
  return response.data;
};

export const deleteContact = async (id: string) => {
  const response = await apiClient.delete(`/contacts/${id}`);
  return response.data;
};

import { apiClient } from './client';
import type { Account } from './accounts';

export interface JournalLine {
  id: string;
  accountId: string;
  account?: Account;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string;
  userId?: string;
  lines: JournalLine[];
  user?: { name: string };
  createdAt: string;
}

export interface CreateJournalLineDto {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateJournalEntryDto {
  date: string;
  description: string;
  reference?: string;
  userId?: string;
  lines: CreateJournalLineDto[];
}

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const response = await apiClient.get('/journal');
  return response.data;
};

export const createJournalEntry = async (data: CreateJournalEntryDto): Promise<JournalEntry> => {
  const response = await apiClient.post('/journal', data);
  return response.data;
};

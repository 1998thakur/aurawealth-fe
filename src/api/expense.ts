import apiClient from './client';
import type {
  ExpenseProfile,
  SpendPreview,
  UpdateExpenseItemsRequest,
} from '../types/expense';

export const expenseApi = {
  listProfiles: async (): Promise<ExpenseProfile[]> => {
    const response = await apiClient.get<ExpenseProfile[]>('/expense-profiles');
    return response.data;
  },

  createProfile: async (label?: string): Promise<ExpenseProfile> => {
    const response = await apiClient.post<ExpenseProfile>('/expense-profiles', label ? { label } : {});
    return response.data;
  },

  deleteProfile: async (id: string): Promise<void> => {
    await apiClient.delete(`/expense-profiles/${id}`);
  },

  getActiveProfile: async (): Promise<ExpenseProfile> => {
    const response = await apiClient.get<ExpenseProfile>('/expense-profiles/active');
    return response.data;
  },

  getProfile: async (id: string): Promise<ExpenseProfile> => {
    const response = await apiClient.get<ExpenseProfile>(`/expense-profiles/${id}`);
    return response.data;
  },

  updateItems: async (id: string, data: UpdateExpenseItemsRequest): Promise<ExpenseProfile> => {
    const response = await apiClient.put<ExpenseProfile>(
      `/expense-profiles/${id}/items`,
      data
    );
    return response.data;
  },

  getPreview: async (id: string): Promise<SpendPreview> => {
    const response = await apiClient.get<SpendPreview>(`/expense-profiles/${id}/preview`);
    return response.data;
  },
};

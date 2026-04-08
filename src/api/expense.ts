import apiClient from './client';
import type {
  CreateExpenseProfileRequest,
  ExpenseProfile,
  SpendPreview,
  UpdateExpenseItemsRequest,
} from '../types/expense';

export const expenseApi = {
  createProfile: async (data: CreateExpenseProfileRequest = {}): Promise<ExpenseProfile> => {
    const response = await apiClient.post<ExpenseProfile>('/expense-profiles', data);
    return response.data;
  },

  getActiveProfile: async (): Promise<ExpenseProfile> => {
    const response = await apiClient.get<ExpenseProfile>('/expense-profiles/active');
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

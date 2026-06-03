import apiClient from './client';
import type {
  GenerateRecommendationsRequest,
  RecommendationSet,
} from '../types/recommendations';

// sortBy values the backend accepts:
// 'rank' | 'netValue' | 'effectiveRate' | 'lowestFee'
export type RecommendationSortBy = 'rank' | 'netValue' | 'effectiveRate' | 'lowestFee';

export const recommendationsApi = {
  generate: async (data: GenerateRecommendationsRequest): Promise<RecommendationSet> => {
    const response = await apiClient.post<RecommendationSet>('/recommendations/generate', data);
    return response.data;
  },

  getLatest: async (profileId?: string, sortBy?: RecommendationSortBy): Promise<RecommendationSet> => {
    const params: Record<string, string> = {};
    if (profileId) params.profileId = profileId;
    if (sortBy && sortBy !== 'rank') params.sortBy = sortBy;
    const response = await apiClient.get<RecommendationSet>('/recommendations/latest', { params });
    return response.data;
  },

  getById: async (setId: string, sortBy?: RecommendationSortBy): Promise<RecommendationSet> => {
    const params: Record<string, string> = {};
    if (sortBy && sortBy !== 'rank') params.sortBy = sortBy;
    const response = await apiClient.get<RecommendationSet>(`/recommendations/${setId}`, { params });
    return response.data;
  },
};

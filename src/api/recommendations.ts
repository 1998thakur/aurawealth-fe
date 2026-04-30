import apiClient from './client';
import type {
  GenerateRecommendationsRequest,
  RecommendationSet,
} from '../types/recommendations';

export const recommendationsApi = {
  generate: async (data: GenerateRecommendationsRequest): Promise<RecommendationSet> => {
    const response = await apiClient.post<RecommendationSet>('/recommendations/generate', data);
    return response.data;
  },

  getLatest: async (profileId?: string): Promise<RecommendationSet> => {
    const params = profileId ? { profileId } : {};
    const response = await apiClient.get<RecommendationSet>('/recommendations/latest', { params });
    return response.data;
  },

  getById: async (setId: string): Promise<RecommendationSet> => {
    const response = await apiClient.get<RecommendationSet>(`/recommendations/${setId}`);
    return response.data;
  },
};

import apiClient from './client';
import type {
  CardBenefit,
  CardDetail,
  CardListParams,
  CardMilestone,
  CardSummary,
  Category,
  Issuer,
  PagedResponse,
  RewardRule,
} from '../types/cards';

export const cardsApi = {
  getCards: async (params: CardListParams = {}): Promise<PagedResponse<CardSummary>> => {
    const searchParams = new URLSearchParams();

    if (params.tiers?.length) {
      params.tiers.forEach((t) => searchParams.append('tiers[]', t));
    }
    if (params.rewardTypes?.length) {
      params.rewardTypes.forEach((r) => searchParams.append('rewardTypes[]', r));
    }
    if (params.annualFeeMax !== undefined) {
      searchParams.set('annualFeeMax', String(params.annualFeeMax));
    }
    if (params.annualFeeMin !== undefined) {
      searchParams.set('annualFeeMin', String(params.annualFeeMin));
    }
    if (params.hasLoungeAccess !== undefined) {
      searchParams.set('hasLoungeAccess', String(params.hasLoungeAccess));
    }
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.size !== undefined) searchParams.set('size', String(params.size));

    const response = await apiClient.get<PagedResponse<CardSummary>>(
      `/cards?${searchParams.toString()}`
    );
    return response.data;
  },

  getCard: async (id: string): Promise<CardDetail> => {
    const response = await apiClient.get<CardDetail>(`/cards/${id}`);
    return response.data;
  },

  getRewardRules: async (id: string): Promise<RewardRule[]> => {
    const response = await apiClient.get<RewardRule[]>(`/cards/${id}/reward-rules`);
    return response.data;
  },

  getBenefits: async (id: string): Promise<CardBenefit[]> => {
    const response = await apiClient.get<CardBenefit[]>(`/cards/${id}/benefits`);
    return response.data;
  },

  getMilestones: async (id: string): Promise<CardMilestone[]> => {
    const response = await apiClient.get<CardMilestone[]>(`/cards/${id}/milestones`);
    return response.data;
  },

  getIssuers: async (): Promise<Issuer[]> => {
    const response = await apiClient.get<Issuer[]>('/issuers');
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },
};

import adminClient from './adminClient';
import apiClient from './client';
import type { CardSummary, PagedResponse } from '../types/cards';

// ─── Response types (match backend DTOs exactly) ────────────────────────────

export interface AdminIssuer {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface AdminRewardRule {
  id: string;
  name: string;
  description?: string;
  ruleType: string;
  priority: number;
  isBaseRate: boolean;
  rate: number;
  rateType: string;
  baseRateValue?: number;
  capPerMonthPoints?: number;
  capPerYearPoints?: number;
  validFrom?: string;
  validUntil?: string;
  requiredFlags?: string[];
  isActive: boolean;
}

export interface AdminCardBenefit {
  id: string;
  category: string;
  name: string;
  description?: string;
  estimatedAnnualValueInr?: number;
  quantity?: number;
  quantityUnit?: string;
  conditions?: string;
  isPrimaryHighlight: boolean;
}

export interface AdminCardMilestone {
  id: string;
  spendThresholdInr: number;
  period: string;
  rewardType: string;
  rewardPoints?: number;
  rewardVoucherValueInr?: number;
  rewardDescription: string;
}

export interface AdminCardDetail {
  id: string;
  name: string;
  slug: string;
  issuer: AdminIssuer;
  tier: string;
  network: string;
  networks: string[];
  variant?: string;
  annualFee: number;
  joiningFee?: number;
  renewalFee?: number;
  rewardType: string;
  pointValueInr?: number;
  purchaseAprMin?: number;
  purchaseAprMax?: number;
  foreignTransactionFeePct?: number;
  minIncomeAnnualInr?: number;
  minCreditScore?: number;
  tagline?: string;
  description?: string;
  cardImageUrl?: string;
  cardImageThumbnailUrl?: string;
  applyUrl?: string;
  hasLoungeAccess?: boolean;
  hasZeroForex?: boolean;
  rewardRules: AdminRewardRule[];
  benefits: AdminCardBenefit[];
  milestones: AdminCardMilestone[];
}

// ─── Request types (match backend request DTOs) ───────────────────────────────

export interface CreateCardRequest {
  issuerId: string;
  name: string;
  slug: string;
  tier: string;
  network: string;
  networks?: string[];
  variant?: string;
  annualFee: number;
  joiningFee?: number;
  renewalFee?: number;
  rewardType: string;
  pointValueInr?: number;
  purchaseAprMin?: number;
  purchaseAprMax?: number;
  foreignTransactionFeePct?: number;
  minIncomeAnnualInr?: number;
  minCreditScore?: number;
  tagline?: string;
  description?: string;
  cardImageUrl?: string;
  applyUrl?: string;
}

export type UpdateCardRequest = Partial<CreateCardRequest> & { networks?: string[] };

export interface CreateRewardRuleRequest {
  name: string;
  description?: string;
  ruleType: string;
  priority?: number;
  isBaseRate?: boolean;
  rate: number;
  rateType: string;
  baseRateValue?: number;
  capPerMonthPoints?: number;
  capPerYearPoints?: number;
  validFrom?: string;
  validUntil?: string;
  requiredFlags?: string[];
  categoryIds?: string[];
  merchantIds?: string[];
  excludedCatIds?: string[];
  minTxnAmount?: number;
}

export interface CreateBenefitRequest {
  category: string;
  name: string;
  description?: string;
  estimatedAnnualValueInr?: number;
  quantity?: number;
  quantityUnit?: string;
  conditions?: string;
  isPrimaryHighlight?: boolean;
  sortOrder?: number;
}

export interface CreateMilestoneRequest {
  spendThresholdInr: number;
  period: string;
  rewardType: string;
  rewardPoints?: number;
  rewardVoucherValueInr?: number;
  rewardDescription: string;
  sortOrder?: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const adminCardsApi = {
  // Card listing — uses public /api/v1/cards (supports pagination + search)
  listCards: async (page = 0, size = 10, search?: string): Promise<PagedResponse<CardSummary>> => {
    const params: Record<string, string | number> = { page, size };
    if (search?.trim()) params.search = search.trim();
    const res = await apiClient.get<PagedResponse<CardSummary>>('/cards', { params });
    return res.data;
  },

  getCard: async (id: string): Promise<AdminCardDetail> => {
    const res = await apiClient.get<AdminCardDetail>(`/cards/${id}`);
    return res.data;
  },

  createCard: async (req: CreateCardRequest): Promise<AdminCardDetail> => {
    const res = await adminClient.post<AdminCardDetail>('/admin/v1/cards', req);
    return res.data;
  },

  updateCard: async (id: string, req: UpdateCardRequest): Promise<AdminCardDetail> => {
    const res = await adminClient.patch<AdminCardDetail>(`/admin/v1/cards/${id}`, req);
    return res.data;
  },

  changeStatus: async (id: string, status: string): Promise<AdminCardDetail> => {
    const res = await adminClient.put<AdminCardDetail>(`/admin/v1/cards/${id}/status`, { status });
    return res.data;
  },

  // Reward Rules
  getRewardRules: async (cardId: string): Promise<AdminRewardRule[]> => {
    const res = await apiClient.get<AdminRewardRule[]>(`/cards/${cardId}/reward-rules`);
    return res.data;
  },

  createRewardRule: async (cardId: string, req: CreateRewardRuleRequest): Promise<AdminRewardRule> => {
    const res = await adminClient.post<AdminRewardRule>(`/admin/v1/cards/${cardId}/reward-rules`, req);
    return res.data;
  },

  // Benefits
  getBenefits: async (cardId: string): Promise<AdminCardBenefit[]> => {
    const res = await apiClient.get<AdminCardBenefit[]>(`/cards/${cardId}/benefits`);
    return res.data;
  },

  createBenefit: async (cardId: string, req: CreateBenefitRequest): Promise<AdminCardBenefit> => {
    const res = await adminClient.post<AdminCardBenefit>(`/admin/v1/cards/${cardId}/benefits`, req);
    return res.data;
  },

  deleteBenefit: async (benefitId: string): Promise<void> => {
    await adminClient.delete(`/admin/v1/benefits/${benefitId}`);
  },

  // Milestones
  getMilestones: async (cardId: string): Promise<AdminCardMilestone[]> => {
    const res = await apiClient.get<AdminCardMilestone[]>(`/cards/${cardId}/milestones`);
    return res.data;
  },

  createMilestone: async (cardId: string, req: CreateMilestoneRequest): Promise<AdminCardMilestone> => {
    const res = await adminClient.post<AdminCardMilestone>(`/admin/v1/cards/${cardId}/milestones`, req);
    return res.data;
  },

  deleteMilestone: async (milestoneId: string): Promise<void> => {
    await adminClient.delete(`/admin/v1/milestones/${milestoneId}`);
  },

  uploadImage: async (cardId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    // Pass FormData directly — Axios detects it and sets multipart/form-data with boundary
    const res = await adminClient.post<{ cardImageUrl: string }>(
      `/admin/v1/cards/${cardId}/image`,
      formData,
    );
    return res.data.cardImageUrl;
  },
};

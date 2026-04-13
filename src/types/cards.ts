export type CardTier = 'ENTRY' | 'STANDARD' | 'PREMIUM' | 'ELITE' | 'SUPER_PREMIUM';
export type RewardType = 'POINTS' | 'CASHBACK' | 'MILES';
export type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | 'RUPAY' | 'DINERS';

// Matches backend CardSummaryResponse record
export interface CardSummary {
  id: string;
  slug: string;
  name: string;
  issuer: Issuer;
  tier: CardTier;
  network: CardNetwork;
  annualFee: number;
  rewardType: RewardType;
  pointValueInr: number;
  cardImageUrl?: string;
  cardImageThumbnailUrl?: string;
  tagline?: string;
  hasLoungeAccess: boolean;
  hasZeroForex: boolean;
  primaryHighlights: string[];
}

// Matches backend CardDetailResponse
export interface CardDetail extends CardSummary {
  description?: string;
  minIncomeAnnualInr?: number;
  minCreditScore?: number;
  feeWaiverThresholdInr?: number;
  rewardRules: RewardRule[];
  benefits: CardBenefit[];
  milestones: CardMilestone[];
}

export interface RewardRule {
  id: string;
  name: string;
  ruleType: string;
  rateType: string;
  rate: number;
  priority: number;
  categoryIds?: string[];
  capPerYearPoints?: number;
  capPerMonthPoints?: number;
}

export interface CardBenefit {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedAnnualValueInr?: number;
  isPrimaryHighlight: boolean;
}

export interface CardMilestone {
  id: string;
  spendThresholdInr: number;
  period: string;
  rewardType: string;
  rewardPoints?: number;
  rewardDescription: string;
}

export interface Issuer {
  id: string;
  name: string;
  logoUrl?: string;
}

// Matches backend CategoryResponse record
export interface Category {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  displayName: string;
  icon?: string;
  level: number;
  hintMonthlyInr?: number;
  sortOrder: number;
  children?: Category[];
}

export interface CardListParams {
  tiers?: CardTier[];
  rewardTypes?: RewardType[];
  annualFeeMax?: number;
  annualFeeMin?: number;
  hasLoungeAccess?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  size?: number;
}

// Matches backend PageResponse record: { items, total, hasMore }
export interface PagedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

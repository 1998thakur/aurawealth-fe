// Matches backend: RecommendationSetResponse record
export interface RecommendationSet {
  id: string;
  generatedAt: string;
  expiresAt: string;
  isStale: boolean;
  items: RecommendationItem[];
}

// Matches backend: RecommendationItemResponse record
export interface RecommendationItem {
  id: string;
  cardId: string;
  cardName: string;
  cardSlug: string;
  issuerName: string;
  cardImageThumbnailUrl?: string;
  rank: number;
  matchScore: number;
  recommendationTags: string[];
  highlightBenefit?: string;
  projectedAnnualPoints: number;
  projectedAnnualValueInr: number;
  netAnnualProfitInr: number;
  effectiveRewardRate: number;
  // Card rendering fields added to backend response
  cardTier: string;
  cardNetwork: string;
  annualFee: number;
}

export interface GenerateRecommendationsRequest {
  expenseProfileId: string;
}

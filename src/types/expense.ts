export interface ExpenseProfile {
  id: string;
  isActive: boolean;
  totalMonthlyInr: number;
  completenessPct: number;
  loungeAccessPreferred: boolean;
  lineItems: LineItem[];
}

export interface LineItem {
  id?: string;
  categoryId: string;
  merchantId?: string;
  monthlyAmountInr: number;
  customLabel?: string;
  categoryName?: string;
}

export interface SpendPreview {
  totalMonthlyInr: number;
  totalAnnualInr: number;
  completenessPct: number;
  categoryBreakdown: {
    categoryId: string;
    name: string;
    monthlyInr: number;
    pct: number;
  }[];
}

export interface CreateExpenseProfileRequest {
  loungeAccessPreferred?: boolean;
}

export interface UpdateExpenseItemsRequest {
  items: LineItem[];
}

export type TravelFrequency = 'RARE' | '1_2_TIMES' | '3_5_TIMES' | '6_PLUS_TIMES';

export interface TravelPreferences {
  domesticFlightsPerMonth: number;
  internationalFlightsPerYear: number;
  loungeAccessPreferred: boolean;
  travelFrequency: TravelFrequency;
}

export type IncomeRange =
  | 'BELOW_3L'
  | '3L_6L'
  | '6L_10L'
  | '10L_20L'
  | '20L_50L'
  | 'ABOVE_50L';

export type EmploymentType = 'SALARIED' | 'SELF_EMPLOYED' | 'BUSINESS' | 'STUDENT' | 'RETIRED';

export type CreditScoreRange = 'BELOW_650' | '650_700' | '700_750' | '750_800' | 'ABOVE_800';

export interface UserProfile {
  incomeRange: IncomeRange;
  employmentType: EmploymentType;
  creditScoreRange: CreditScoreRange;
  preferredRewardType: 'CASHBACK' | 'POINTS' | 'MILES';
}

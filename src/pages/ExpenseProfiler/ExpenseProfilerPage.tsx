import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import AppLayout from '../../components/Layout/AppLayout';
import SpendInput from '../../components/SpendInput';
import { cardsApi } from '../../api/cards';
import { expenseApi } from '../../api/expense';
import { recommendationsApi } from '../../api/recommendations';
import type { TravelFrequency } from '../../types/expense';

const STEP_LABELS = ['Monthly Spending', 'Travel & Preferences', 'Your Profile'];

interface SpendData {
  [categoryId: string]: number;
}

interface TravelData {
  domesticFlightsPerMonth: number;
  internationalFlightsPerYear: number;
  loungeAccessPreferred: boolean;
  travelFrequency: TravelFrequency;
}

interface ProfileData {
  incomeRange: string;
  employmentType: string;
  creditScoreRange: string;
  preferredRewardType: 'CASHBACK' | 'POINTS' | 'MILES';
}

const DEFAULT_CATEGORIES = [
  { id: 'shopping', name: 'Shopping', icon: 'shopping_bag' },
  { id: 'travel', name: 'Travel', icon: 'flight' },
  { id: 'dining', name: 'Dining', icon: 'restaurant' },
  { id: 'groceries', name: 'Groceries', icon: 'local_grocery_store' },
  { id: 'fuel', name: 'Fuel', icon: 'local_gas_station' },
  { id: 'utilities', name: 'Utilities', icon: 'bolt' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
];

const INCOME_OPTIONS = [
  { value: 'BELOW_3L', label: 'Below ₹3 Lakh' },
  { value: '3L_6L', label: '₹3 – 6 Lakh' },
  { value: '6L_10L', label: '₹6 – 10 Lakh' },
  { value: '10L_20L', label: '₹10 – 20 Lakh' },
  { value: '20L_50L', label: '₹20 – 50 Lakh' },
  { value: 'ABOVE_50L', label: 'Above ₹50 Lakh' },
];

const EMPLOYMENT_OPTIONS = [
  { value: 'SALARIED', label: 'Salaried' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'BUSINESS', label: 'Business Owner' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'RETIRED', label: 'Retired' },
];

const CREDIT_SCORE_OPTIONS = [
  { value: 'BELOW_650', label: 'Below 650' },
  { value: '650_700', label: '650 – 700' },
  { value: '700_750', label: '700 – 750' },
  { value: '750_800', label: '750 – 800' },
  { value: 'ABOVE_800', label: 'Above 800' },
];

const TRAVEL_FREQ_OPTIONS: { value: TravelFrequency; label: string }[] = [
  { value: 'RARE', label: 'Rarely (once a year or less)' },
  { value: '1_2_TIMES', label: '1–2 times a year' },
  { value: '3_5_TIMES', label: '3–5 times a year' },
  { value: '6_PLUS_TIMES', label: '6+ times a year' },
];

const REWARD_TYPE_OPTIONS: { value: 'CASHBACK' | 'POINTS' | 'MILES'; label: string; icon: string; desc: string }[] = [
  {
    value: 'CASHBACK',
    label: 'Cashback',
    icon: 'payments',
    desc: 'Direct money back on every purchase.',
  },
  {
    value: 'POINTS',
    label: 'Reward Points',
    icon: 'stars',
    desc: 'Redeem for shopping, travel, or gifts.',
  },
  {
    value: 'MILES',
    label: 'Air Miles',
    icon: 'flight',
    desc: 'Earn miles for free flights & upgrades.',
  },
];

export default function ExpenseProfilerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [spendData, setSpendData] = useState<SpendData>({});
  const [travelData, setTravelData] = useState<TravelData>({
    domesticFlightsPerMonth: 0,
    internationalFlightsPerYear: 0,
    loungeAccessPreferred: false,
    travelFrequency: 'RARE',
  });
  const [profileData, setProfileData] = useState<ProfileData>({
    incomeRange: '10L_20L',
    employmentType: 'SALARIED',
    creditScoreRange: '700_750',
    preferredRewardType: 'POINTS',
  });
  const [error, setError] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: cardsApi.getCategories,
  });

  const displayCategories = categories?.length ? categories : DEFAULT_CATEGORIES;

  const createProfileMutation = useMutation({
    mutationFn: () =>
      expenseApi.createProfile({ loungeAccessPreferred: travelData.loungeAccessPreferred }),
  });

  const updateItemsMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: { categoryId: string; monthlyAmountInr: number }[] }) =>
      expenseApi.updateItems(id, { items }),
  });

  const generateRecsMutation = useMutation({
    mutationFn: (expenseProfileId: string) =>
      recommendationsApi.generate({ expenseProfileId }),
  });

  const handleFinalSubmit = async () => {
    setError('');
    try {
      const profile = await createProfileMutation.mutateAsync();

      const items = Object.entries(spendData)
        .filter(([, amount]) => amount > 0)
        .map(([categoryId, monthlyAmountInr]) => ({ categoryId, monthlyAmountInr }));

      if (items.length > 0) {
        await updateItemsMutation.mutateAsync({ id: profile.id, items });
      }

      const recs = await generateRecsMutation.mutateAsync(profile.id);
      navigate(`/recommendations/${recs.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const isSubmitting =
    createProfileMutation.isPending ||
    updateItemsMutation.isPending ||
    generateRecsMutation.isPending;

  const totalMonthly = Object.values(spendData).reduce((a, b) => a + b, 0);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-on-surface mb-1">
          Expense Profiler
        </h1>
        <p className="font-body text-on-surface-variant text-sm">
          Tell us about your spending to get personalized card recommendations.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={clsx(
                'flex items-center gap-2 font-body text-sm font-medium transition-colors',
                i <= step ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              <div
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  i < step
                    ? 'bg-primary text-on-primary'
                    : i === step
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                )}
              >
                {i < step ? (
                  <span className="material-symbols-outlined text-xs">check</span>
                ) : (
                  i + 1
                )}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-surface-container rounded-full h-1.5 mt-3">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="card-surface p-6">
        {/* Step 1: Monthly Spending */}
        {step === 0 && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface mb-1">
                  Monthly Spending
                </h2>
                <p className="font-body text-sm text-on-surface-variant">
                  Enter your approximate monthly spend in each category.
                </p>
              </div>
              {totalMonthly > 0 && (
                <div className="text-right shrink-0">
                  <p className="font-body text-xs text-on-surface-variant">Total</p>
                  <p className="font-headline font-bold text-primary">
                    ₹{totalMonthly.toLocaleString('en-IN')}/mo
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCategories.map((cat) => (
                <SpendInput
                  key={cat.id}
                  label={'displayName' in cat ? (cat as { displayName: string }).displayName : cat.name}
                  icon={cat.icon ?? 'category'}
                  value={spendData[cat.id] ?? 0}
                  onChange={(val) =>
                    setSpendData((prev) => ({ ...prev, [cat.id]: val }))
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Travel & Preferences */}
        {step === 1 && (
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-1">
              Travel & Preferences
            </h2>
            <p className="font-body text-sm text-on-surface-variant mb-6">
              Help us understand your travel habits and card preferences.
            </p>
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="label-field">Domestic flights per month</label>
                <input
                  type="number"
                  min={0}
                  value={travelData.domesticFlightsPerMonth}
                  onChange={(e) =>
                    setTravelData((prev) => ({
                      ...prev,
                      domesticFlightsPerMonth: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label-field">International flights per year</label>
                <input
                  type="number"
                  min={0}
                  value={travelData.internationalFlightsPerYear}
                  onChange={(e) =>
                    setTravelData((prev) => ({
                      ...prev,
                      internationalFlightsPerYear: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label-field">Travel frequency</label>
                <select
                  value={travelData.travelFrequency}
                  onChange={(e) =>
                    setTravelData((prev) => ({
                      ...prev,
                      travelFrequency: e.target.value as TravelFrequency,
                    }))
                  }
                  className="input-field w-full"
                >
                  {TRAVEL_FREQ_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                <div>
                  <p className="font-body font-semibold text-on-surface text-sm">
                    Airport Lounge Access
                  </p>
                  <p className="font-body text-xs text-on-surface-variant mt-0.5">
                    Prefer cards with complimentary lounge access
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTravelData((prev) => ({
                      ...prev,
                      loungeAccessPreferred: !prev.loungeAccessPreferred,
                    }))
                  }
                  className={clsx(
                    'relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none',
                    travelData.loungeAccessPreferred ? 'bg-primary' : 'bg-outline-variant'
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                      travelData.loungeAccessPreferred ? 'translate-x-6' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Profile */}
        {step === 2 && (
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-1">
              Your Profile
            </h2>
            <p className="font-body text-sm text-on-surface-variant mb-6">
              Your financial profile helps us filter eligible cards.
            </p>
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="label-field">Annual income bracket</label>
                <select
                  value={profileData.incomeRange}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, incomeRange: e.target.value }))
                  }
                  className="input-field w-full"
                >
                  {INCOME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Employment type</label>
                <select
                  value={profileData.employmentType}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, employmentType: e.target.value }))
                  }
                  className="input-field w-full"
                >
                  {EMPLOYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Credit score range</label>
                <select
                  value={profileData.creditScoreRange}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, creditScoreRange: e.target.value }))
                  }
                  className="input-field w-full"
                >
                  {CREDIT_SCORE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred reward type */}
              <div>
                <p className="label-field">Preferred reward type</p>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {REWARD_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setProfileData((prev) => ({
                          ...prev,
                          preferredRewardType: opt.value,
                        }))
                      }
                      className={clsx(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors text-center',
                        profileData.preferredRewardType === opt.value
                          ? 'border-primary bg-primary-fixed/30 text-primary'
                          : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/40'
                      )}
                    >
                      <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                      <span className="font-body text-xs font-semibold">{opt.label}</span>
                      <span className="font-body text-xs leading-tight text-on-surface-variant hidden sm:block">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 bg-error-container text-error text-sm font-body px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-outlined flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>
          ) : (
            <div />
          )}
          {step < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary flex items-center gap-2"
            >
              Next
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  Get My Recommendations
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

import type { UserSubscription } from '@/hooks/useSubscription';

// 전문가 상담은 시간 구독형 단일 체계 — 시간당 ₩39,000 (5/10/20/30시간 시간권)
export const EXPERT_HOUR_RATE = 39000;
// 호환용: 1시간 기준가
export const EXPERT_BASE_PRICE = EXPERT_HOUR_RATE;

export type ExpertDiscountTier = 'none' | 'monthly' | 'yearly' | 'lifetime';

export interface ExpertPricing {
  base: number;
  final: number;
  discountPercent: number;
  tier: ExpertDiscountTier;
  label: string;
}

/**
 * 구독자 시간권 추가 구매 시 할인율.
 */
export function getExpertDiscountTier(
  subscription: UserSubscription | null | undefined
): ExpertDiscountTier {
  if (!subscription || subscription.status !== 'active') return 'none';

  if (subscription.is_lifetime || subscription.subscription_type === 'lifetime') {
    return 'lifetime';
  }

  const planName = subscription.plan?.name?.toLowerCase() || '';
  const periodMs =
    subscription.current_period_start && subscription.current_period_end
      ? new Date(subscription.current_period_end).getTime() -
        new Date(subscription.current_period_start).getTime()
      : 0;
  const periodDays = periodMs / (1000 * 60 * 60 * 24);

  const isYearly =
    /year|연간|annual|12개월/.test(planName) || periodDays > 180;

  if (subscription.subscription_type === 'premium' || subscription.subscription_type === 'paid') {
    return isYearly ? 'yearly' : 'monthly';
  }

  return 'none';
}

export function calculateExpertPricing(
  subscription: UserSubscription | null | undefined,
  basePrice: number = EXPERT_BASE_PRICE
): ExpertPricing {
  const tier = getExpertDiscountTier(subscription);
  const discountMap: Record<ExpertDiscountTier, number> = {
    none: 0,
    monthly: 10,
    yearly: 15,
    lifetime: 15,
  };
  const labelMap: Record<ExpertDiscountTier, string> = {
    none: '',
    monthly: '월간 구독자 10% 할인',
    yearly: '연간 구독자 15% 할인',
    lifetime: '평생 이용권 15% 할인',
  };
  const discountPercent = discountMap[tier];
  const final = Math.round((basePrice * (100 - discountPercent)) / 100);
  return {
    base: basePrice,
    final,
    discountPercent,
    tier,
    label: labelMap[tier],
  };
}

export function formatKRW(value: number): string {
  return `₩${value.toLocaleString('ko-KR')}`;
}

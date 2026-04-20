import type { UserSubscription } from '@/hooks/useSubscription';

export const EXPERT_BASE_PRICE = 49000;

export type ExpertDiscountTier = 'none' | 'monthly' | 'yearly' | 'lifetime';

export interface ExpertPricing {
  base: number;
  final: number;
  discountPercent: number;
  tier: ExpertDiscountTier;
  label: string;
}

/**
 * 구독 정보를 기반으로 전문가 상담 할인율을 계산합니다.
 * - 월간 구독자: 30% 할인
 * - 연간/평생 구독자: 50% 할인
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

  // 연간 플랜 (이름에 yearly/연간/annual 포함되거나 기간이 180일 초과)
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
    monthly: 30,
    yearly: 50,
    lifetime: 50,
  };
  const labelMap: Record<ExpertDiscountTier, string> = {
    none: '',
    monthly: '월간 구독자 30% 할인',
    yearly: '연간 구독자 50% 할인',
    lifetime: '평생 이용권 50% 할인',
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

import type { UserSubscription } from '@/hooks/useSubscription';
import { getExpertDiscountTier } from './expertPricing';

export type ConsultationChannel = 'kakao' | 'zoom' | 'phone' | 'in_person';

export interface ConsultationOffering {
  id: string;
  offering_key: string;
  name: string;
  description: string | null;
  channel: ConsultationChannel;
  duration_minutes: number;
  validity_days: number | null;
  base_price: number;
  monthly_subscriber_price: number;
  yearly_subscriber_price: number;
  is_emergency: boolean;
  display_order: number;
  is_active: boolean;
}

export interface UserConsultationCredit {
  id: string;
  user_id: string;
  offering_key: string;
  credit_amount: number;
  source: string;
  granted_at: string;
  expires_at: string | null;
  used_at: string | null;
}

/**
 * 구독 등급에 따라 패키지 최종 가격을 계산합니다.
 */
export function getOfferingPriceForUser(
  offering: ConsultationOffering,
  subscription: UserSubscription | null | undefined
): { final: number; original: number; discountPercent: number; tierLabel: string } {
  const tier = getExpertDiscountTier(subscription);
  let final = offering.base_price;
  let discountPercent = 0;
  let tierLabel = '';

  if (tier === 'monthly') {
    final = offering.monthly_subscriber_price;
    discountPercent = Math.round(((offering.base_price - final) / offering.base_price) * 100);
    tierLabel = '월간 구독자 혜택';
  } else if (tier === 'yearly' || tier === 'lifetime') {
    final = offering.yearly_subscriber_price;
    discountPercent = Math.round(((offering.base_price - final) / offering.base_price) * 100);
    tierLabel = tier === 'lifetime' ? '평생 이용권 혜택' : '연간 구독자 혜택';
  }

  return { final, original: offering.base_price, discountPercent, tierLabel };
}

export const channelMeta: Record<ConsultationChannel, { label: string; icon: string }> = {
  kakao: { label: '카톡 비동기', icon: '💬' },
  zoom: { label: '줌 화상', icon: '📹' },
  phone: { label: '전화', icon: '📞' },
  in_person: { label: '대면', icon: '🤝' },
};

import React from 'react';
import { Button } from '@/components/ui/button';
import { Ticket, Crown, FileText, MessageCircle } from 'lucide-react';
import { MIND_TRACK_7_PRICE } from '@/constants/tokenCosts';
import { EXPERT_BASE_PRICE } from '@/lib/expertPricing';

interface ExchangeItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cost: number;
  color: string;
}

const exchangeItems: ExchangeItem[] = [
  {
    id: 'mind_track_7_discount_2k',
    icon: <Ticket className="w-5 h-5" />,
    title: '7일 마음 트랙 ₩2,000 할인',
    description: `₩${MIND_TRACK_7_PRICE.toLocaleString()} → ₩${(MIND_TRACK_7_PRICE - 2000).toLocaleString()}`,
    cost: 2000,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 'mind_track_7_discount_4k',
    icon: <FileText className="w-5 h-5" />,
    title: '7일 마음 트랙 ₩4,000 할인',
    description: `₩${MIND_TRACK_7_PRICE.toLocaleString()} → ₩${(MIND_TRACK_7_PRICE - 4000).toLocaleString()}`,
    cost: 4000,
    color: 'text-purple-500 bg-purple-50',
  },
  {
    id: 'mind_track_7_free',
    icon: <Crown className="w-5 h-5" />,
    title: '7일 마음 트랙 무료 이용권',
    description: `₩${MIND_TRACK_7_PRICE.toLocaleString()} 상당 100% 무료`,
    cost: MIND_TRACK_7_PRICE,
    color: 'text-amber-500 bg-amber-50',
  },
  {
    id: 'expert_consult_discount_10k',
    icon: <MessageCircle className="w-5 h-5" />,
    title: '전문가 1:1 상담 ₩10,000 할인',
    description: `₩${EXPERT_BASE_PRICE.toLocaleString()} → ₩${(EXPERT_BASE_PRICE - 10000).toLocaleString()}`,
    cost: 10000,
    color: 'text-emerald-500 bg-emerald-50',
  },
  {
    id: 'expert_consult_discount_25k',
    icon: <MessageCircle className="w-5 h-5" />,
    title: '전문가 1:1 상담 ₩25,000 할인',
    description: `₩${EXPERT_BASE_PRICE.toLocaleString()} → ₩${(EXPERT_BASE_PRICE - 25000).toLocaleString()}`,
    cost: 25000,
    color: 'text-teal-500 bg-teal-50',
  },
  {
    id: 'expert_consult_free',
    icon: <Crown className="w-5 h-5" />,
    title: '전문가 1:1 상담 무료 이용권',
    description: `₩${EXPERT_BASE_PRICE.toLocaleString()} 상당 100% 무료`,
    cost: EXPERT_BASE_PRICE,
    color: 'text-rose-500 bg-rose-50',
  },
];

interface RewardExchangeProps {
  balance: number;
}

export const RewardExchange: React.FC<RewardExchangeProps> = ({ balance }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold">포인트 교환소</h3>
        <span className="text-sm text-muted-foreground">보유: ₩{balance.toLocaleString()}</span>
      </div>
      
      {exchangeItems.map((item) => {
        const canAfford = balance >= item.cost;
        return (
          <div key={item.id} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm">{item.title}</span>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Button
              size="sm"
              disabled={!canAfford}
              className={canAfford 
                ? 'bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg' 
                : 'text-xs'
              }
              variant={canAfford ? 'default' : 'outline'}
            >
              ₩{item.cost.toLocaleString()}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

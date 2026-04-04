import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Ticket, Crown, FileText } from 'lucide-react';

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
    id: 'test_credit',
    icon: <Ticket className="w-5 h-5" />,
    title: '심층 검사 이용권',
    description: '₩990 상당 전문 검사 1회',
    cost: 990,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 'report_credit',
    icon: <FileText className="w-5 h-5" />,
    title: 'AI 리포트 이용권',
    description: '₩3,900 상당 심층 리포트 1회',
    cost: 3900,
    color: 'text-purple-500 bg-purple-50',
  },
  {
    id: 'subscription_discount',
    icon: <Crown className="w-5 h-5" />,
    title: '구독 50% 할인',
    description: '₩9,900 → ₩4,950 1개월 구독',
    cost: 4950,
    color: 'text-amber-500 bg-amber-50',
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

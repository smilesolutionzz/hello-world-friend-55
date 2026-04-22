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
    id: 'mind_track_discount_5k',
    icon: <Ticket className="w-5 h-5" />,
    title: '30일 마음 트랙 ₩5,000 할인',
    description: '₩19,900 → ₩14,900',
    cost: 5000,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 'mind_track_discount_10k',
    icon: <FileText className="w-5 h-5" />,
    title: '30일 마음 트랙 ₩10,000 할인',
    description: '₩19,900 → ₩9,900',
    cost: 10000,
    color: 'text-purple-500 bg-purple-50',
  },
  {
    id: 'mind_track_free',
    icon: <Crown className="w-5 h-5" />,
    title: '30일 마음 트랙 무료 이용권',
    description: '₩19,900 상당 100% 무료',
    cost: 19900,
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

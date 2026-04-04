import React from 'react';
import { Coins } from 'lucide-react';

interface RewardPointsHeaderProps {
  balance: number;
  totalEarned: number;
}

export const RewardPointsHeader: React.FC<RewardPointsHeaderProps> = ({ balance, totalEarned }) => {
  return (
    <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-90">보유 포인트</span>
        <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
          1P = ₩1
        </div>
      </div>
      <div className="flex items-center gap-3 mb-1">
        <div className="bg-white/20 rounded-full p-2">
          <Coins className="w-6 h-6" />
        </div>
        <div className="text-4xl font-extrabold tracking-tight">
          ₩{balance.toLocaleString()}
        </div>
      </div>
      <div className="text-sm opacity-80">
        누적 적립: ₩{totalEarned.toLocaleString()}
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

export const LimitedTimeOffer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/40 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-400 animate-pulse" />
          <h3 className="text-white font-bold text-lg">오늘만 특별 혜택</h3>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full">
          <Clock className="w-4 h-4 text-orange-300" />
          <span className="text-orange-300 font-mono font-bold text-sm">
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">✓ 첫 전문가 상담 50% 할인</span>
          <span className="text-orange-400 font-bold">남은 슬롯: 7개</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">✓ 프리미엄 1개월 무료 체험</span>
          <span className="text-orange-400 font-bold">남은 슬롯: 12개</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">✓ 즉시 응답 보너스 토큰 +100</span>
          <span className="text-green-400 font-bold">누구나</span>
        </div>
      </div>
    </div>
  );
};

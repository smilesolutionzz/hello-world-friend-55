import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Infinity, Check, Gift, Clock } from 'lucide-react';

interface LifetimeCountdownCardProps {
  onNavigate: () => void;
}

const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // 매일 자정을 기준으로 24시간 카운트다운
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeLeft;
};

export const LifetimeCountdownCard: React.FC<LifetimeCountdownCardProps> = ({ onNavigate }) => {
  const { hours, minutes, seconds } = useCountdown();

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <Card className="relative overflow-hidden border-2 border-yellow-400 shadow-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-amber-400/10 to-orange-400/10 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl"></div>
      
      {/* 특가 배지 */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 text-lg font-bold shadow-lg animate-bounce">
          🔥 특별 한정 할인 🔥
        </Badge>
      </div>
      
      <CardContent className="relative z-10 p-8 pt-12">
        {/* 카운트다운 타이머 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-red-600 font-semibold">오늘 특가 마감까지</span>
          <div className="flex items-center gap-1 font-mono text-xl font-bold">
            <span className="bg-red-500 text-white px-2 py-1 rounded">{formatNumber(hours)}</span>
            <span className="text-red-500">:</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded">{formatNumber(minutes)}</span>
            <span className="text-red-500">:</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded">{formatNumber(seconds)}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* 왼쪽: 아이콘 & 타이틀 */}
          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
                  평생이용권
                </h2>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Infinity className="w-4 h-4" /> 한 번 구매로 평생 이용
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">모든 심리검사 무제한 이용</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">AI 상담 무제한 이용</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">프리미엄 기능 전체 해금</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">향후 업데이트 무료 제공</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-1">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-purple-600">초기 구매자 특별 혜택</span>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 가격 & 구매 버튼 */}
          <div className="text-center lg:text-right">
            <div className="mb-4">
              <div className="text-lg text-muted-foreground line-through">정가 ₩199,000</div>
              <div className="text-5xl font-bold text-orange-600 mt-2">
                ₩99,000
              </div>
              <div className="text-lg text-green-600 font-semibold mt-1">
                50% 할인 중!
              </div>
            </div>
            
            <Button 
              size="lg"
              className="w-full lg:w-auto px-12 py-6 text-xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={onNavigate}
            >
              <Crown className="w-6 h-6 mr-2" />
              평생이용권 구매하기
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              ✅ 100% 만족 보장 | 7일 환불 정책
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

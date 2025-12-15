import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Clock, 
  Gift, 
  Zap, 
  Crown,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';

export const MainPromoSection = () => {
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const [isFreeTrialEligible, setIsFreeTrialEligible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) {
        setIsFreeTrialEligible(true);
        return;
      }

      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .in('subscription_type', ['premium', 'lifetime'])
        .limit(1);

      const { data: trials } = await supabase
        .from('user_free_trials')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_type', 'premium')
        .limit(1);

      setIsFreeTrialEligible(
        (!subscriptions || subscriptions.length === 0) &&
        (!trials || trials.length === 0)
      );
    };

    checkEligibility();
  }, [user]);

  const benefits = [
    '모든 AI 심리검사 무제한',
    '전문가 상담 우선 예약',
    '프리미엄 리포트 무료',
    '광고 없는 쾌적한 환경'
  ];

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* 상단 배지 */}
        <div className="flex justify-center mb-6">
          <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-1.5 text-sm font-bold animate-pulse">
            <Gift className="w-4 h-4 mr-1" />
            신규회원 1개월 무료
          </Badge>
        </div>

        {/* 메인 프로모션 카드 */}
        <Card className="relative overflow-hidden border-2 border-violet-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl">
          {/* 배경 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-purple-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* 왼쪽: 혜택 정보 */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-6 h-6 text-violet-400" />
                    <span className="text-violet-400 font-bold text-lg">프리미엄 패스</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                    {isFreeTrialEligible ? (
                      <>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">1개월 무료</span> 체험
                      </>
                    ) : (
                      <>
                        프리미엄 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">무제한</span>
                      </>
                    )}
                  </h2>
                  <p className="text-slate-400">
                    {isFreeTrialEligible 
                      ? '신규 회원 전용 - 1개월 무료 체험 후 결정하세요!'
                      : '모든 AI 검사와 프리미엄 기능을 무제한으로 이용하세요'
                    }
                  </p>
                </div>

                {/* 혜택 리스트 */}
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* 가격 정보 */}
                <div className="flex items-baseline gap-3">
                  {isFreeTrialEligible ? (
                    <>
                      <span className="text-4xl font-black text-white">₩0</span>
                      <span className="text-slate-400">
                        첫 달 무료 → 이후 <span className="text-violet-400 font-semibold">₩29,900</span>/월
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-white">₩29,900<span className="text-lg font-normal text-slate-400">/월</span></span>
                    </>
                  )}
                </div>
              </div>

              {/* 오른쪽: 타이머 & CTA */}
              <div className="space-y-6">
                {/* 카운트다운 */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-fuchsia-400" />
                    <span className="text-fuchsia-400 font-semibold">
                      {isFreeTrialEligible ? '무료 체험 마감까지' : '오늘 자정까지'}
                    </span>
                  </div>
                  <div className="flex justify-center gap-3">
                    {[
                      { value: timeLeft.hours, label: '시간' },
                      { value: timeLeft.minutes, label: '분' },
                      { value: timeLeft.seconds, label: '초' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg px-4 py-3 border border-slate-600">
                          <span className="text-3xl font-mono font-bold text-white">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 block">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA 버튼 */}
                <Button
                  onClick={() => navigate('/token-subscription?plan=premium')}
                  size="lg"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/30"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {isFreeTrialEligible ? '무료 체험 시작하기' : '프리미엄 시작하기'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* 보장 문구 */}
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span>✓ 언제든 해지 가능</span>
                  <span>✓ 무료 체험 후 결정</span>
                </div>
              </div>
            </div>

            {/* 하단 보너스 배너 */}
            {isFreeTrialEligible && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span className="text-slate-300">
                    1개월 무료 체험 후 <span className="text-violet-400 font-bold">자동 구독</span> - 언제든 해지 가능!
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 하단 안내 */}
        <p className="text-center text-slate-500 text-sm mt-6">
          이미 3,247명의 사용자가 프리미엄을 선택했습니다
        </p>
      </div>
    </section>
  );
};

export default MainPromoSection;

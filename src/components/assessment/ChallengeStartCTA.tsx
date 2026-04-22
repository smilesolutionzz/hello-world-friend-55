import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Calendar, ArrowRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChallengeStartCTAProps {
  testName?: string;
  recommendedFocus?: string;
  source?: string;
}

/**
 * 검사 결과 직후 노출되는 30일 마음 챌린지 가입 CTA.
 * 우선 전환 동선이며 ResultPaywall, PostPaymentConversionFlow보다 상단 배치.
 */
const ChallengeStartCTA = ({ testName, recommendedFocus, source }: ChallengeStartCTAProps) => {
  const navigate = useNavigate();

  const handleStart = () => {
    const params = new URLSearchParams();
    if (source) params.set('from', source);
    if (recommendedFocus) params.set('focus', recommendedFocus);
    navigate(`/mind-track?${params.toString()}`);
  };

  return (
    <Card className="relative overflow-hidden border-0 my-6 bg-gradient-to-br from-primary/95 via-primary to-primary/90 text-primary-foreground shadow-xl">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
            결과 기반 맞춤 프로그램
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
          이 결과를 시작점으로<br />
          <span className="text-white">30일 마음 챌린지</span>를 시작해보세요
        </h3>

        <p className="text-sm md:text-base opacity-90 mb-5 leading-relaxed">
          {testName ? `${testName} 결과` : '오늘 검사 결과'}를 baseline으로 저장하고,
          매일 5분 가이드와 주간 변화 추적으로 30일 후 같은 검사를 다시 받아 변화를 측정해드려요.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: Calendar, label: '매일 5분' },
            { icon: Target, label: '맞춤 미션' },
            { icon: Sparkles, label: '변화 측정' },
          ].map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <item.icon className="w-4 h-4 mx-auto mb-1 opacity-90" />
              <p className="text-[11px] font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        <Button
          onClick={handleStart}
          size="lg"
          variant="secondary"
          className="w-full bg-white text-primary hover:bg-white/90 font-bold text-base shadow-lg group"
        >
          30일 마음 챌린지 시작하기
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="text-[11px] opacity-75 text-center mt-3">
          ₩19,900 일시불 · 30일 환불 보장 · 자동 결제 없음
        </p>
      </div>
    </Card>
  );
};

export default ChallengeStartCTA;

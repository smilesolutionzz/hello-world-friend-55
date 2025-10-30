import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bgImage from '@/assets/value-comparison-bg.jpg';

const ValueComparisonSection = () => {
  const navigate = useNavigate();

  const comparison = [
    {
      feature: "이용 방법",
      traditional: "예약 필요 (1~2주 대기)",
      aiHighlight: "지금 바로 시작 (0분)",
      highlighted: true
    },
    {
      feature: "소요 시간",
      traditional: "50분 + 이동 시간",
      aiHighlight: "3분 완료"
    },
    {
      feature: "비용",
      traditional: "회당 10~20만원",
      aiHighlight: "무료 체험 → 월 2.9만원",
      highlighted: true
    },
    {
      feature: "접근성",
      traditional: "오프라인 방문 필수",
      aiHighlight: "24시간 모바일 접속"
    },
    {
      feature: "전문성",
      traditional: "상담사 개인 역량 차이",
      aiHighlight: "AI + 검증된 전문가",
      highlighted: true
    },
    {
      feature: "연속성",
      traditional: "회당 단발성 상담",
      aiHighlight: "지속적 관리 & 모니터링"
    },
    {
      feature: "프라이버시",
      traditional: "대면 상담 (불편함)",
      aiHighlight: "완전 익명 (편안함)",
      highlighted: true
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-background/80" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">똑똑한 선택</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            왜 AiHumanPro를 선택해야 할까요?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            기존 심리 상담과 비교해보세요
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
            <CardContent className="p-0">
              {/* Header Row */}
              <div className="grid grid-cols-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b-2 border-primary/20">
                <div className="p-6 border-r border-primary/10"></div>
                <div className="p-6 text-center border-r border-primary/10">
                  <p className="text-sm text-muted-foreground font-medium">전통적 상담</p>
                </div>
                <div className="p-6 text-center bg-gradient-to-br from-primary/20 to-primary/10">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <p className="text-sm font-bold text-primary">AiHumanPro</p>
                  </div>
                </div>
              </div>

              {/* Comparison Rows */}
              {comparison.map((item, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-3 border-b border-primary/10 transition-colors hover:bg-primary/5 ${
                    item.highlighted ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="p-6 border-r border-primary/10 font-semibold">
                    {item.feature}
                  </div>
                  <div className="p-6 text-center border-r border-primary/10">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <X className="w-4 h-4 text-destructive" />
                      <span className="text-sm">{item.traditional}</span>
                    </div>
                  </div>
                  <div className="p-6 text-center bg-gradient-to-br from-primary/10 to-transparent">
                    <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                      <Check className="w-5 h-5" />
                      <span className="text-sm">{item.aiHighlight}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA Row */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-8 text-center">
                <p className="text-lg font-semibold mb-4">
                  지금 시작하면 <span className="text-primary">첫 테스트 무료</span> + 
                  <span className="text-primary"> 10개 토큰 증정</span>
                </p>
                <Button 
                  size="lg"
                  onClick={() => navigate('/assessment')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <span className="flex items-center gap-2">
                    무료로 시작하기
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  신용카드 등록 불필요 · 언제든 해지 가능
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
};

export default ValueComparisonSection;

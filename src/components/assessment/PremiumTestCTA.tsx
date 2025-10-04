import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumTestCTAProps {
  currentTestType: string;
  title?: string;
  description?: string;
}

export function PremiumTestCTA({ 
  currentTestType,
  title = "더 정밀한 검사가 필요하신가요?",
  description = "프리미엄 전문 검사로 더 깊이 있는 분석과 맞춤 솔루션을 받아보세요."
}: PremiumTestCTAProps) {
  const navigate = useNavigate();

  const getPremiumTestRecommendation = () => {
    switch (currentTestType) {
      case 'mental-health-quick':
        return {
          testName: '정신건강 전문 검사',
          testRoute: '/assessment',
          benefits: [
            '30개 이상의 심층 질문으로 정확한 진단',
            '전문의 수준의 상세 분석 리포트',
            '맞춤형 치료 및 관리 계획 제공',
            '월별 추적 관리 및 개선도 분석'
          ]
        };
      case 'otrovert':
        return {
          testName: 'MBTI + 성격 종합 검사',
          testRoute: '/assessment',
          benefits: [
            '16가지 성격 유형 정밀 분석',
            '직업 적합도 및 진로 상담',
            '대인관계 패턴 심층 분석',
            '자기계발 로드맵 제공'
          ]
        };
      case 'communication-style':
        return {
          testName: '관계 심리 전문 검사',
          testRoute: '/assessment',
          benefits: [
            '애착 유형 및 소통 패턴 분석',
            '파트너십 호환성 진단',
            '갈등 해결 전략 제공',
            '관계 개선 실천 프로그램'
          ]
        };
      default:
        return {
          testName: '전문 심리 검사',
          testRoute: '/assessment',
          benefits: [
            '전문가 수준의 정밀 분석',
            '개인 맞춤형 상담 리포트',
            '실천 가능한 솔루션 제공',
            '지속적인 관리 및 추적'
          ]
        };
    }
  };

  const recommendation = getPremiumTestRecommendation();

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-lg mt-8">
      <CardContent className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <Badge className="mb-3 bg-primary/90">Premium 추천</Badge>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 mb-6 border border-primary/20">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">✨</span>
            {recommendation.testName}
          </h4>
          <ul className="space-y-3">
            {recommendation.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="lg" 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => navigate(recommendation.testRoute)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            프리미엄 검사 시작하기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/subscription')}
          >
            구독 플랜 보기
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          💎 프리미엄 회원은 모든 전문 검사를 무제한으로 이용할 수 있습니다
        </p>
      </CardContent>
    </Card>
  );
}

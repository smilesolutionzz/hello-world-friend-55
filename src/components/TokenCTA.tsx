import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TokenCTAProps {
  context?: 'observation' | 'report' | 'dashboard' | 'assessment' | 'ai-counselor' | 'general';
  title?: string;
  description?: string;
}

const TokenCTA = ({ 
  context = 'general',
  title,
  description 
}: TokenCTAProps) => {
  const navigate = useNavigate();

  const getContextContent = () => {
    switch (context) {
      case 'observation':
        return {
          title: title || "더 자세한 분석이 필요하신가요?",
          description: description || "캐시를 구매하고 심화 분석 리포트를 받아보세요.",
          icon: <Sparkles className="h-6 w-6" />
        };
      case 'report':
        return {
          title: title || "전문가급 리포트가 기다리고 있어요",
          description: description || "차트, PDF 다운로드, 전문가 코멘트까지 한번에!",
          icon: <Crown className="h-6 w-6" />
        };
      case 'assessment':
        return {
          title: title || "더 정확한 분석을 원하시나요?",
          description: description || "캐시로 상세 분석과 전문가 상담을 받아보세요",
          icon: <Sparkles className="h-6 w-6" />
        };
      case 'ai-counselor':
        return {
          title: title || "24시간 무제한 AI 상담",
          description: description || "프로 플랜으로 무제한 AI 상담과 전문가 연결 서비스를 이용해보세요",
          icon: <Crown className="h-6 w-6" />
        };
      case 'dashboard':
        return {
          title: title || "프리미엄으로 더 많은 혜택을",
          description: description || "무제한 분석, 전문가 코멘트, PDF 리포트까지",
          icon: <Crown className="h-6 w-6" />
        };
      default:
        return {
          title: title || "AI 심리 분석의 새로운 차원",
          description: description || "전문가 수준의 분석과 개인 맞춤 상담으로 더 나은 내일을 만들어보세요",
          icon: <Sparkles className="h-6 w-6" />
        };
    }
  };

  const content = getContextContent();

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            {content.icon}
          </div>
          <CardTitle className="text-xl">{content.title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <p className="text-muted-foreground mb-6">
          {content.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/token-subscription')}
            className="flex items-center gap-2 w-full sm:w-auto"
            aria-label="구독 플랜 보기"
          >
            <Crown className="h-4 w-4" />
            캐시 구매하기
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
            aria-label="무료로 체험하기"
          >
            무료로 체험하기
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>기록할수록 패턴이 보입니다. 4회차부터는 장기 추적/전문가 코멘트가 열립니다.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCTA;
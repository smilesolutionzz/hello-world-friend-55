import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionCTAProps {
  context?: 'assessment' | 'ai-counselor' | 'dashboard' | 'general';
  title?: string;
  description?: string;
}

const SubscriptionCTA = ({ 
  context = 'general',
  title,
  description 
}: SubscriptionCTAProps) => {
  const navigate = useNavigate();

  const getContextContent = () => {
    switch (context) {
      case 'assessment':
        return {
          title: title || "더 정확한 분석을 원하시나요?",
          description: description || "프리미엄 플랜으로 월 5회 상세 분석과 전문가 상담을 받아보세요",
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
          title: title || "구독으로 더 많은 기능을",
          description: description || "개인 맞춤 분석, 전문가 상담, 우선 지원을 경험해보세요",
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
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-2"
          >
            구독 플랜 보기
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/assessment')}
          >
            무료로 체험하기
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• 언제든 취소 가능 • 첫 달 체험 가능 • 전문가 리포트 제공</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCTA;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FreeTrialGateProps {
  onStartFreeTrial: () => void;
  featureName?: string;
}

const FreeTrialGate: React.FC<FreeTrialGateProps> = ({ 
  onStartFreeTrial, 
  featureName = "이 기능"
}) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Gift className="w-6 h-6 text-primary" />
          무료 체험으로 시작하세요!
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          회원가입 없이 {featureName}을 무료로 체험해보실 수 있습니다
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 무료 체험 혜택 */}
        <div className="bg-white/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            무료 체험 혜택
          </h4>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span>3분 간단 테스트</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>AI 기반 즉시 분석</span>
            </li>
            <li className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-500" />
              <span>개인 맞춤 결과 제공</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>회원가입 시 10개 토큰 무료 지급</span>
            </li>
          </ul>
        </div>

        {/* CTA 버튼들 */}
        <div className="space-y-3">
          <Button
            onClick={onStartFreeTrial}
            className="w-full bg-gradient-to-r from-primary to-primary-glow text-white"
            size="lg"
          >
            <Gift className="w-4 h-4 mr-2" />
            무료 체험 시작하기
          </Button>
          
          <div className="text-center text-xs text-muted-foreground">
            체험 후 더 자세한 분석이 필요하시면 회원가입하세요
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="flex-1"
            >
              회원가입 (10토큰 무료)
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>

        {/* 추가 안내 */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 text-center">
          <p className="font-medium text-primary mb-1">💡 더 많은 기능이 필요하다면?</p>
          <p className="text-sm text-muted-foreground">
            회원가입하시면 <span className="font-bold text-primary">10개 토큰 무료</span> + 매일 3개 토큰 지급
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeTrialGate;
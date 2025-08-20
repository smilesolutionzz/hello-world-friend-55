import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Crown, Lock, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SubscriptionUsage {
  usage_count: number;
  subscription_status: 'free' | 'premium';
  trial_used: boolean;
}

interface SubscriptionGateProps {
  onProceed: () => void;
  sessionCount?: number;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ onProceed, sessionCount = 0 }) => {
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const usageData = data || { 
        usage_count: 0, 
        subscription_status: 'free' as 'free' | 'premium', 
        trial_used: false 
      };
      
      // Type guard to ensure subscription_status is valid
      const validatedUsage: SubscriptionUsage = {
        usage_count: (usageData as any).usage_count || 0,
        subscription_status: ((usageData as any).status === 'active' ? 'premium' : 'free') as 'free' | 'premium',
        trial_used: (usageData as any).trial_used || false
      };
      
      setUsage(validatedUsage);
    } catch (error: any) {
      console.error('Usage data loading error:', error);
      toast({
        title: "데이터 로드 실패",
        description: "사용량 정보를 불러올 수 없습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 프리미엄 사용자는 바로 진행
  if (usage?.subscription_status === 'premium') {
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            프리미엄 회원
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Badge variant="default" className="px-4 py-2">
              무제한 관찰일지 작성 가능
            </Badge>
            <p className="text-muted-foreground">
              프리미엄 회원으로서 모든 기능을 무제한으로 이용하실 수 있습니다.
            </p>
            <Button onClick={onProceed} className="w-full" size="lg">
              관찰일지 작성 시작하기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const freeUsageCount = usage?.usage_count || 0;
  const remainingFreeUses = Math.max(0, 3 - freeUsageCount);
  const progressPercentage = (freeUsageCount / 3) * 100;

  // 무료 체험 기간 (3회 이하)
  if (remainingFreeUses > 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            무료 체험 중
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>무료 체험 진행률</span>
              <span className="font-medium">{freeUsageCount}/3회 사용</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-center text-muted-foreground">
              <span className="font-medium text-primary">{remainingFreeUses}회</span> 더 무료로 체험하실 수 있습니다.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">🎁 무료 체험 혜택</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 기본 관찰일지 작성 및 AI 분석</li>
              <li>• 간단한 요약 리포트 제공</li>
              <li>• 미디어 파일 업로드 (최대 3개)</li>
            </ul>
          </div>

          <Button onClick={onProceed} className="w-full" size="lg">
            무료 체험 계속하기 ({remainingFreeUses}회 남음)
          </Button>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/token-subscription')}
              className="text-primary border-primary hover:bg-primary/10"
            >
              프리미엄 플랜 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 무료 체험 완료 - 구독 유도
  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          무료 체험 완료
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="px-4 py-2">
            3회 무료 체험을 모두 사용하셨습니다
          </Badge>
          <p className="text-muted-foreground">
            더 정밀한 분석과 고급 기능을 위해 프리미엄으로 업그레이드하세요.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <Crown className="w-4 h-4" />
              프리미엄 플랜 혜택
            </h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>무제한 관찰일지 작성</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>심화 AI 분석 및 대시보드</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>누적 데이터 비교 분석</span>
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>전문가급 PDF 리포트</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 text-center">
            <p className="font-medium text-primary mb-2">특별 할인 혜택</p>
            <p className="text-sm text-muted-foreground">
              첫 달 <span className="line-through">29,000원</span> → <span className="font-bold text-primary">14,500원 (50% 할인)</span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/token-subscription')}
            className="w-full"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            프리미엄으로 업그레이드
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            대시보드로 돌아가기
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          언제든지 취소 가능 • 첫 7일 무료 체험
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionGate;
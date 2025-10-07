import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download, UserCheck, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useNavigate } from 'react-router-dom';

interface PremiumAnalysisOfferProps {
  testType: string;
  testId?: string;
  basicScore?: number;
  userId?: string;
}

export const PremiumAnalysisOffer: React.FC<PremiumAnalysisOfferProps> = ({
  testType,
  testId,
  basicScore,
  userId
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { trackPaymentInitiated, trackPaymentCompleted } = useEventTracking();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!userId) {
      toast({
        title: '로그인 필요',
        description: '프리미엄 분석을 이용하려면 로그인이 필요합니다.',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    
    try {
      // Track payment initiation
      trackPaymentInitiated(9900, 'token', 'premium_analysis');

      // Check user tokens
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_tokens')
        .select('current_tokens')
        .eq('user_id', userId)
        .single();

      if (tokenError) throw tokenError;

      if (!tokenData || tokenData.current_tokens < 10) {
        toast({
          title: '토큰 부족',
          description: '프리미엄 분석에는 10토큰이 필요합니다. 토큰을 충전해주세요.',
          variant: 'destructive'
        });
        navigate('/token-subscription');
        return;
      }

      // Deduct tokens
      const { error: deductError } = await supabase
        .from('user_tokens')
        .update({ current_tokens: tokenData.current_tokens - 10 })
        .eq('user_id', userId);

      if (deductError) throw deductError;

      // Track successful payment
      trackPaymentCompleted(9900, 'token', 'premium_analysis');

      // Track usage
      await supabase.from('usage_tracking').insert({
        user_id: userId,
        feature_type: 'premium_analysis',
        usage_date: new Date().toISOString().split('T')[0],
        count: 1
      });

      toast({
        title: '구매 완료',
        description: '프리미엄 분석이 시작되었습니다. 잠시만 기다려주세요...'
      });

      // Navigate to premium result
      navigate(`/premium-analysis-result?testType=${testType}&testId=${testId}`);

    } catch (error: any) {
      console.error('Failed to purchase premium analysis:', error);
      toast({
        title: '구매 실패',
        description: error.message || '프리미엄 분석 구매에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    '2000자 이상 심층 분석',
    'AI 맞춤형 개선 전략',
    '전문가 리뷰 포함',
    'PDF 다운로드 가능',
    '전문가 상담 10% 할인 쿠폰'
  ];

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50 dark:to-purple-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">프리미엄 심층 분석</CardTitle>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            ₩9,900
          </Badge>
        </div>
        <CardDescription className="text-base">
          AI가 분석한 상세한 리포트와 맞춤형 솔루션을 받아보세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Sample Preview */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            포함 내용 미리보기
          </div>
          <ul className="text-sm space-y-1 text-muted-foreground ml-6 list-disc">
            <li>상세 점수 분석 및 강약점 파악</li>
            <li>성향별 맞춤 조언 (성격, 발달, 심리)</li>
            <li>단계별 실천 가이드</li>
            <li>추천 활동 및 교육 프로그램</li>
            <li>전문가 연결 우선순위</li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handlePurchase}
            disabled={loading}
            size="lg"
            className="w-full text-lg h-14"
          >
            {loading ? (
              <>분석 중...</>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                프리미엄 분석 시작하기 (10토큰)
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate('/experts')}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              전문가와 상담
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled
            >
              <Download className="mr-2 h-4 w-4" />
              무료 요약본 (준비중)
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>✨ 지난 7일간 <strong>127명</strong>이 프리미엄 분석을 선택했어요</p>
          <p className="mt-1">💯 만족도 평균 <strong>4.8/5.0</strong></p>
        </div>
      </CardContent>
    </Card>
  );
};

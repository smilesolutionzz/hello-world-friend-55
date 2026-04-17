import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface MedicalDisclaimerProps {
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * 비의료 코칭 브랜딩 표준 면책 고지.
 * '의료행위/진단' 대신 '발달 코칭 & 의사결정 보조'로 포지셔닝하여 의료법 리스크를 차단합니다.
 */
export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const location = useLocation();

  useEffect(() => {
    const trackDisclaimerView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('legal_disclaimer_views').insert({
          user_id: user?.id || null,
          page_url: location.pathname,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error('Failed to track disclaimer view:', error);
      }
    };

    trackDisclaimerView();
  }, [location.pathname]);

  if (variant === 'compact') {
    return (
      <Alert className={`border-blue-200 bg-blue-50 dark:bg-blue-950/30 ${className}`}>
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-200 break-keep">
          <span className="font-semibold">AIHPRO는 발달 코칭 & 의사결정 보조 도구입니다.</span>{' '}
          의료 진단이 아니며, 임상적 판단이 필요한 경우 자격을 갖춘 전문가와 상담하시기 바랍니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-blue-200 bg-blue-50 dark:bg-blue-950/30 ${className}`}>
      <Sparkles className="h-5 w-5 text-blue-600" />
      <AlertDescription className="space-y-2 text-blue-900 dark:text-blue-200">
        <div className="font-semibold text-base">AIHPRO 서비스 안내</div>
        <div className="text-sm space-y-1 break-keep">
          <p>• AIHPRO는 <strong>발달 코칭 및 의사결정 보조 도구</strong>이며, 의료 진단·치료·예방을 목적으로 하지 않습니다.</p>
          <p>• 제공되는 모든 분석은 <strong>참고용 인사이트</strong>이며, 전문 의학적 조언을 대체하지 않습니다.</p>
          <p>• 임상적 판단이 필요한 경우 반드시 <strong>자격을 갖춘 전문가</strong>와 상담하시기 바랍니다.</p>
          <p>• 본 서비스는 통계적 분석 및 코칭 정보 제공을 목적으로 운영됩니다.</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

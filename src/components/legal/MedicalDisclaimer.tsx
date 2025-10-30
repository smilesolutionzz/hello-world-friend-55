import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface MedicalDisclaimerProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const location = useLocation();

  useEffect(() => {
    // Track disclaimer view for compliance
    const trackDisclaimerView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('legal_disclaimer_views').insert({
          user_id: user?.id || null,
          page_url: location.pathname,
          user_agent: navigator.userAgent
        });
      } catch (error) {
        console.error('Failed to track disclaimer view:', error);
      }
    };

    trackDisclaimerView();
  }, [location.pathname]);

  if (variant === 'compact') {
    return (
      <Alert className={`border-amber-200 bg-amber-50 dark:bg-amber-950/30 ${className}`}>
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-semibold">⚠️ 중요:</span> 본 서비스는 의료행위가 아니며, 
          전문적인 진단이나 치료를 대체할 수 없습니다. 정확한 진단과 치료는 반드시 
          의료 전문가와 상담하시기 바랍니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 dark:bg-amber-950/30 ${className}`}>
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertDescription className="space-y-2 text-amber-800 dark:text-amber-200">
        <div className="font-semibold text-base">⚠️ 법적 고지사항</div>
        <div className="text-sm space-y-1">
          <p>• 본 서비스는 <strong>의료행위가 아니며</strong>, 질병의 진단, 치료, 예방을 목적으로 하지 않습니다.</p>
          <p>• 제공되는 모든 정보는 <strong>참고용</strong>이며, 전문적인 의학적 조언을 대체할 수 없습니다.</p>
          <p>• 의료 관련 의사결정은 반드시 <strong>의료기관 및 전문의와 상담</strong> 후 진행하시기 바랍니다.</p>
          <p>• 본 서비스 이용으로 인한 어떠한 결과에 대해서도 법적 책임을 지지 않습니다.</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

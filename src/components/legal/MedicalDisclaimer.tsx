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
      <Alert className={`border-red-300 bg-red-50 dark:bg-red-950/30 ${className}`}>
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-sm text-red-900 dark:text-red-200">
          <div className="space-y-1">
            <p className="font-bold text-base">⚠️ 법적 고지 (필독)</p>
            <p><strong>본 서비스는 의료행위가 아닙니다.</strong> 질병의 진단, 치료, 예방을 목적으로 하지 않으며, 제공되는 정보는 참고용입니다.</p>
            <p><strong>의료 관련 결정은 반드시 의료기관 및 면허를 가진 전문의와 상담</strong> 후 진행하시기 바랍니다.</p>
            <p className="text-xs">본 서비스 이용으로 인한 어떠한 결과에 대해서도 법적 책임을 지지 않습니다.</p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-red-300 bg-red-50 dark:bg-red-950/30 ${className}`}>
      <AlertCircle className="h-6 w-6 text-red-600" />
      <AlertDescription className="space-y-3 text-red-900 dark:text-red-200">
        <div className="font-bold text-lg">⚠️ 법적 고지사항 (의료법 준수)</div>
        <div className="text-sm space-y-2 leading-relaxed">
          <p><strong>1. 의료행위 아님:</strong> 본 서비스는 <strong className="text-red-700 dark:text-red-300">의료행위가 아니며</strong>, 질병의 진단, 치료, 예방, 처방을 목적으로 하지 않습니다. (의료법 제27조 준수)</p>
          <p><strong>2. 참고자료:</strong> 제공되는 모든 검사, 평가, 분석은 <strong>교육 및 참고 목적</strong>이며, 의학적 진단이나 전문적 의료 조언을 대체할 수 없습니다.</p>
          <p><strong>3. 전문가 상담 필수:</strong> 건강 문제, 발달 문제, 정신건강 문제에 대한 의사결정은 <strong>반드시 의료기관 및 면허를 가진 전문의(의사, 언어재활사 등)와 직접 상담</strong> 후 진행하시기 바랍니다.</p>
          <p><strong>4. AI 분석의 한계:</strong> AI 분석 결과는 알고리즘에 기반한 참고 정보이며, 의학적 정확성을 보장하지 않습니다.</p>
          <p><strong>5. 응급상황:</strong> 자해, 자살 충동 등 응급상황 시 즉시 119 또는 정신건강위기상담전화 1577-0199로 연락하십시오.</p>
          <p className="font-semibold text-red-700 dark:text-red-300">• 본 서비스 이용으로 인한 어떠한 직접적, 간접적 손해 또는 결과에 대해서도 운영자는 법적 책임을 지지 않습니다.</p>
          <p className="text-xs mt-2 border-t border-red-300 pt-2">본 고지사항은 의료법, 보건의료기본법, 개인정보보호법을 준수하기 위한 것입니다.</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

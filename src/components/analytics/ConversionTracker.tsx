import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEventTracking } from '@/hooks/useEventTracking';
import { trackEvent } from '@/components/common/Analytics';

/**
 * ConversionTracker - 주요 전환 지점 추적
 * 
 * 추적하는 전환 이벤트:
 * 1. 히어로 섹션 → 검사 시작 버튼 클릭
 * 2. 검사 시작 → 검사 완료
 * 3. 검사 완료 → 결과 확인
 * 4. 결과 확인 → 전문가 연결 클릭
 * 5. 무료 사용자 → 유료 전환
 */
export const ConversionTracker = () => {
  const location = useLocation();
  const { trackPageView } = useEventTracking();

  useEffect(() => {
    // 페이지 방문 추적
    trackPageView();
    
    // 주요 전환 페이지 이벤트
    const path = location.pathname;
    
    if (path === '/assessment') {
      trackEvent('funnel_assessment_start', {
        page: path,
        timestamp: new Date().toISOString()
      });
    } else if (path.includes('/results') || path.includes('/assessment-detail')) {
      trackEvent('funnel_results_view', {
        page: path,
        timestamp: new Date().toISOString()
      });
    } else if (path === '/experts') {
      trackEvent('funnel_experts_view', {
        page: path,
        timestamp: new Date().toISOString()
      });
    } else if (path === '/subscription' || path === '/token-purchase') {
      trackEvent('funnel_payment_page', {
        page: path,
        timestamp: new Date().toISOString()
      });
    } else if (path === '/payment-success' || path === '/token-payment-success') {
      trackEvent('funnel_payment_complete', {
        page: path,
        timestamp: new Date().toISOString()
      });
    }
  }, [location, trackPageView]);

  return null;
};

// 버튼 클릭 추적을 위한 헬퍼 함수들
export const trackButtonClick = (buttonName: string, context?: Record<string, any>) => {
  trackEvent('button_click', {
    button_name: buttonName,
    ...context
  });
};

export const trackFormSubmit = (formName: string, context?: Record<string, any>) => {
  trackEvent('form_submit', {
    form_name: formName,
    ...context
  });
};

export const trackTestProgress = (testType: string, progress: number) => {
  trackEvent('test_progress', {
    test_type: testType,
    progress_percentage: progress
  });
};

export const trackDropOff = (stage: string, context?: Record<string, any>) => {
  trackEvent('user_drop_off', {
    stage: stage,
    ...context
  });
};

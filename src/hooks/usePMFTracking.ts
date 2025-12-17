// PMF 검증을 위한 핵심 지표 추적 훅
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PMFEvent {
  event_type: string;
  event_data?: Record<string, any>;
  page_path?: string;
  user_segment?: string;
}

export const PMF_EVENTS = {
  // 퍼널 단계
  LANDING_VIEW: 'landing_view',
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  FREE_TRIAL_START: 'free_trial_start',
  FIRST_OBSERVATION: 'first_observation',
  FIRST_AI_ANALYSIS: 'first_ai_analysis',
  
  // 전환 이벤트
  SIGNUP_CLICK: 'signup_click',
  SIGNUP_COMPLETE: 'signup_complete',
  PAYMENT_PAGE_VIEW: 'payment_page_view',
  PAYMENT_ATTEMPT: 'payment_attempt',
  PAYMENT_SUCCESS: 'payment_success',
  
  // 참여 이벤트
  RETURN_VISIT: 'return_visit',
  FEATURE_USE: 'feature_use',
  SHARE_CLICK: 'share_click',
  
  // 피드백 이벤트
  NPS_SHOWN: 'nps_shown',
  NPS_SUBMITTED: 'nps_submitted',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  
  // 이탈 이벤트
  BOUNCE: 'bounce',
  EXIT_INTENT: 'exit_intent',
} as const;

export const usePMFTracking = () => {
  // 세션 시작 시 방문 추적
  useEffect(() => {
    const isReturning = localStorage.getItem('pmf_visited') === 'true';
    if (isReturning) {
      trackEvent({ event_type: PMF_EVENTS.RETURN_VISIT });
    }
    localStorage.setItem('pmf_visited', 'true');
    localStorage.setItem('pmf_last_visit', new Date().toISOString());
  }, []);

  const trackEvent = useCallback(async (event: PMFEvent) => {
    const sessionId = getOrCreateSessionId();
    const userId = await getCurrentUserId();
    
    const eventData = {
      ...event,
      session_id: sessionId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      page_path: event.page_path || window.location.pathname,
      user_agent: navigator.userAgent,
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
    };

    // 로컬 저장 (오프라인 지원)
    saveEventLocally(eventData);
    
    // 서버 전송 시도
    try {
      await supabase.from('pmf_events').insert(eventData);
    } catch (error) {
      console.log('PMF event saved locally:', eventData);
    }
  }, []);

  const trackFunnelStep = useCallback((step: string, data?: Record<string, any>) => {
    trackEvent({
      event_type: step,
      event_data: {
        ...data,
        funnel_position: getFunnelPosition(step),
      },
    });
  }, [trackEvent]);

  const trackConversion = useCallback((type: string, value?: number) => {
    trackEvent({
      event_type: type,
      event_data: {
        conversion_value: value,
        time_to_convert: getTimeToConvert(),
      },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackFunnelStep,
    trackConversion,
    PMF_EVENTS,
  };
};

// 헬퍼 함수들
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('pmf_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('pmf_session_id', sessionId);
    sessionStorage.setItem('pmf_session_start', new Date().toISOString());
  }
  return sessionId;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || localStorage.getItem('pmf_anonymous_id') || createAnonymousId();
}

function createAnonymousId(): string {
  const id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('pmf_anonymous_id', id);
  return id;
}

function saveEventLocally(event: any) {
  const events = JSON.parse(localStorage.getItem('pmf_events_queue') || '[]');
  events.push(event);
  // 최대 100개 이벤트 유지
  if (events.length > 100) events.shift();
  localStorage.setItem('pmf_events_queue', JSON.stringify(events));
}

function getFunnelPosition(step: string): number {
  const funnel = [
    PMF_EVENTS.LANDING_VIEW,
    PMF_EVENTS.ONBOARDING_START,
    PMF_EVENTS.ONBOARDING_COMPLETE,
    PMF_EVENTS.FREE_TRIAL_START,
    PMF_EVENTS.FIRST_OBSERVATION,
    PMF_EVENTS.FIRST_AI_ANALYSIS,
    PMF_EVENTS.SIGNUP_COMPLETE,
    PMF_EVENTS.PAYMENT_SUCCESS,
  ];
  return funnel.indexOf(step) + 1;
}

function getTimeToConvert(): number {
  const sessionStart = sessionStorage.getItem('pmf_session_start');
  if (!sessionStart) return 0;
  return Date.now() - new Date(sessionStart).getTime();
}

export default usePMFTracking;

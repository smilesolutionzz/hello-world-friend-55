import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export type EventType = 
  | 'test_started'
  | 'test_completed'
  | 'result_viewed'
  | 'expert_connection_clicked'
  | 'payment_initiated'
  | 'payment_completed'
  | 'premium_analysis_viewed'
  | 'pdf_downloaded'
  | 'share_clicked'
  | 'page_view';

interface EventProperties {
  test_type?: string;
  test_id?: string;
  score?: number;
  payment_amount?: number;
  payment_method?: string;
  expert_id?: string;
  [key: string]: any;
}

export const useEventTracking = () => {
  const location = useLocation();

  const trackEvent = useCallback(async (
    eventName: EventType,
    properties?: EventProperties
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);

      await supabase.from('user_analytics_events').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        event_name: eventName,
        page_path: location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        event_properties: properties || {}
      });

      console.log(`📊 Event tracked: ${eventName}`, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [location.pathname]);

  const trackPageView = useCallback(() => {
    trackEvent('page_view', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, trackEvent]);

  const trackTestStart = useCallback((testType: string, testId?: string) => {
    trackEvent('test_started', { test_type: testType, test_id: testId });
  }, [trackEvent]);

  const trackTestComplete = useCallback((testType: string, score?: number, testId?: string) => {
    trackEvent('test_completed', { test_type: testType, score, test_id: testId });
  }, [trackEvent]);

  const trackResultView = useCallback((testType: string, testId?: string) => {
    trackEvent('result_viewed', { test_type: testType, test_id: testId });
  }, [trackEvent]);

  const trackExpertConnection = useCallback((expertId?: string, testType?: string) => {
    trackEvent('expert_connection_clicked', { expert_id: expertId, test_type: testType });
  }, [trackEvent]);

  const trackPaymentInitiated = useCallback((amount: number, method: string, itemType: string) => {
    trackEvent('payment_initiated', { 
      payment_amount: amount, 
      payment_method: method,
      item_type: itemType
    });
  }, [trackEvent]);

  const trackPaymentCompleted = useCallback((amount: number, method: string, itemType: string) => {
    trackEvent('payment_completed', { 
      payment_amount: amount, 
      payment_method: method,
      item_type: itemType
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackTestStart,
    trackTestComplete,
    trackResultView,
    trackExpertConnection,
    trackPaymentInitiated,
    trackPaymentCompleted
  };
};

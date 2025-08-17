import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface BehaviorData {
  type: string;
  typingSpeed?: number;
  sessionDuration?: number;
  clickPattern?: any;
  scrollBehavior?: any;
  sessionId?: string;
  deviceInfo?: any;
  timestamp?: number;
  timeContext?: any;
  rapidNavigation?: any;
}

interface LifestyleData {
  date?: string;
  sleep_hours?: number;
  sleep_quality?: number;
  exercise_minutes?: number;
  mood_score?: number;
  stress_level?: number;
  social_interactions?: number;
  weather_condition?: string;
  notes?: string;
}

interface PersonalizedRecommendation {
  id: string;
  recommendation_type: string;
  content: any;
  trigger_reason: string;
  status: string;
  created_at: string;
}

export const usePersonalization = () => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user's profile ID
  useEffect(() => {
    const getCurrentProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setCurrentProfileId(profile.id);
        }
      }
    };

    getCurrentProfile();
  }, []);

  // Track user behavior
  const trackBehavior = useCallback(async (behaviorData: BehaviorData) => {
    if (!currentProfileId) return;

    try {
      await supabase.functions.invoke('personalization-engine', {
        body: {
          action: 'track_behavior',
          profileId: currentProfileId,
          behaviorData: {
            ...behaviorData,
            sessionId: behaviorData.sessionId || generateSessionId(),
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  }, [currentProfileId]);

  // Generate personalized recommendations
  const getPersonalizedRecommendation = useCallback(async (type: 'motivation' | 'meditation' | 'social' | 'lifestyle') => {
    if (!currentProfileId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalization-engine', {
        body: {
          action: 'generate_recommendations',
          profileId: currentProfileId,
          requestType: type
        }
      });

      if (error) throw error;

      toast({
        title: "개인화 추천 생성 완료",
        description: `맞춤형 ${type} 추천을 받았습니다.`,
      });

      return data;
    } catch (error) {
      console.error('Error generating recommendation:', error);
      toast({
        title: "추천 생성 오류",
        description: "개인화 추천을 생성하는데 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentProfileId, toast]);

  // Log lifestyle data
  const logLifestyle = useCallback(async (lifestyleData: LifestyleData) => {
    if (!currentProfileId) return;

    try {
      await supabase.functions.invoke('personalization-engine', {
        body: {
          action: 'log_lifestyle',
          profileId: currentProfileId,
          lifestyleData
        }
      });

      toast({
        title: "라이프스타일 기록 완료",
        description: "일일 라이프스타일 데이터가 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error logging lifestyle:', error);
      toast({
        title: "기록 저장 오류",
        description: "라이프스타일 데이터 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [currentProfileId, toast]);

  // Find social matches
  const findSocialMatches = useCallback(async () => {
    if (!currentProfileId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalization-engine', {
        body: {
          action: 'find_social_matches',
          profileId: currentProfileId
        }
      });

      if (error) throw error;

      toast({
        title: "소셜 매칭 완료",
        description: data.message || "비슷한 사용자들을 찾았습니다.",
      });

      return data;
    } catch (error) {
      console.error('Error finding matches:', error);
      toast({
        title: "매칭 오류",
        description: "소셜 매칭에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentProfileId, toast]);

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    if (!currentProfileId) return;

    try {
      const { data, error } = await supabase
        .from('personalized_recommendations')
        .select('*')
        .eq('profile_id', currentProfileId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  }, [currentProfileId]);

  // Load insights
  const loadInsights = useCallback(async () => {
    if (!currentProfileId) return;

    try {
      const { data, error } = await supabase
        .from('user_insights')
        .select('*')
        .eq('profile_id', currentProfileId)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  }, [currentProfileId]);

  // Mark recommendation as engaged
  const engageWithRecommendation = useCallback(async (recommendationId: string) => {
    try {
      await supabase
        .from('personalized_recommendations')
        .update({
          status: 'engaged',
          engaged_at: new Date().toISOString()
        })
        .eq('id', recommendationId);
    } catch (error) {
      console.error('Error engaging with recommendation:', error);
    }
  }, []);

  // Auto-track typing behavior
  const trackTypingBehavior = useCallback((text: string, timeToType: number) => {
    if (text.length > 0 && timeToType > 0) {
      const typingSpeed = (text.length / timeToType) * 60; // characters per minute
      trackBehavior({
        type: 'text_input',
        typingSpeed,
        sessionId: generateSessionId()
      });
    }
  }, [trackBehavior]);

  // Auto-track page views
  const trackPageView = useCallback((page: string, duration?: number) => {
    trackBehavior({
      type: 'page_view',
      sessionDuration: duration,
      sessionId: generateSessionId()
    });
  }, [trackBehavior]);

  // Track login
  const trackLogin = useCallback(() => {
    trackBehavior({
      type: 'login',
      sessionId: generateSessionId()
    });
  }, [trackBehavior]);

  // Load data when profile ID is available
  useEffect(() => {
    if (currentProfileId) {
      loadRecommendations();
      loadInsights();
    }
  }, [currentProfileId, loadRecommendations, loadInsights]);

  return {
    // State
    recommendations,
    insights,
    isLoading,
    currentProfileId,
    
    // Actions
    trackBehavior,
    getPersonalizedRecommendation,
    logLifestyle,
    findSocialMatches,
    loadRecommendations,
    loadInsights,
    engageWithRecommendation,
    
    // Auto-tracking helpers
    trackTypingBehavior,
    trackPageView,
    trackLogin,
  };
};

// Helper function to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
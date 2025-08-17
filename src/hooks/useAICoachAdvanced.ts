import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface EmotionData {
  text?: string;
  voiceTone?: string;
  behaviorPattern?: string;
  currentEmotion?: string;
  intensity?: number;
  triggerSituation?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

export interface RelationshipData {
  relationshipType: 'family' | 'romantic' | 'friendship' | 'work';
  recentInteraction: string;
  conflictDescription?: string;
  communicationStyle?: string;
}

export interface LifestyleData {
  sleepHours: number;
  sleepQuality: number;
  exerciseMinutes: number;
  moodRating: number;
  stressLevel: number;
  nutritionNotes?: string;
}

export interface CoachingSession {
  id: string;
  sessionType: 'emotion_monitoring' | 'cbt_coaching' | 'relationship_coaching' | 'lifestyle_coaching';
  startTime: string;
  endTime?: string;
  effectivenessScore?: number;
}

export interface CBTHomework {
  id: string;
  assignmentType: 'thought_record' | 'behavior_experiment' | 'exposure_exercise';
  title: string;
  description: string;
  instructions: any;
  dueDate?: string;
  completionStatus: 'pending' | 'in_progress' | 'completed' | 'skipped';
  difficultyLevel: number;
}

export interface ConversationMessage {
  id: string;
  messageType: 'user' | 'ai_coach';
  content: string;
  timestamp: string;
  emotionDetected?: string;
  interventionType?: string;
}

export function useAICoachAdvanced() {
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null);
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [cbtHomework, setCbtHomework] = useState<CBTHomework[]>([]);
  const [emotionLogs, setEmotionLogs] = useState<any[]>([]);
  const { toast } = useToast();

  // Get current user profile
  const getCurrentProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) throw new Error('Profile not found');
    return profile.id;
  }, []);

  // Start a coaching session
  const startCoachingSession = useCallback(async (sessionType: CoachingSession['sessionType']) => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfile();

      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          action: 'start_session',
          profileId,
          sessionType,
        },
      });

      if (error) throw error;

      const newSession: CoachingSession = {
        id: data.sessionId,
        sessionType,
        startTime: new Date().toISOString(),
      };

      setCurrentSession(newSession);
      toast({
        title: "세션 시작",
        description: `${getSessionTypeLabel(sessionType)} 세션이 시작되었습니다.`,
      });

      return data.sessionId;
    } catch (error) {
      console.error('Error starting coaching session:', error);
      toast({
        title: "오류",
        description: "코칭 세션을 시작할 수 없습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentProfile, toast]);

  // Analyze emotion in real-time
  const analyzeEmotion = useCallback(async (emotionData: EmotionData) => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfile();

      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          action: 'analyze_emotion',
          profileId,
          emotionData,
        },
      });

      if (error) throw error;

      // Update emotion logs
      await fetchEmotionLogs();

      if (data.needsIntervention) {
        toast({
          title: "감정 변화 감지",
          description: data.interventionMessage,
          duration: 8000,
        });
      }

      return data;
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      toast({
        title: "오류",
        description: "감정 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentProfile, toast]);

  // Chat with AI coach
  const chatWithCoach = useCallback(async (message: string, sessionType: CoachingSession['sessionType'] = 'emotion_monitoring') => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfile();

      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          action: 'chat_with_coach',
          profileId,
          userMessage: message,
          sessionType,
        },
      });

      if (error) throw error;

      // Refresh conversation history
      await fetchConversations();

      return data.message;
    } catch (error) {
      console.error('Error chatting with coach:', error);
      toast({
        title: "오류",
        description: "AI 코치와의 대화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentProfile, toast]);

  // Generate CBT homework
  const generateCBTHomework = useCallback(async () => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfile();

      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          action: 'generate_cbt_homework',
          profileId,
        },
      });

      if (error) throw error;

      await fetchCBTHomework();

      toast({
        title: "새로운 CBT 숙제",
        description: `"${data.assignment.title}" 과제가 생성되었습니다.`,
      });

      return data;
    } catch (error) {
      console.error('Error generating CBT homework:', error);
      toast({
        title: "오류",
        description: "CBT 숙제 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentProfile, toast]);

  // Analyze relationship
  const analyzeRelationship = useCallback(async (relationshipData: RelationshipData) => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfile();

      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          action: 'analyze_relationship',
          profileId,
          relationshipData,
        },
      });

      if (error) throw error;

      toast({
        title: "관계 분석 완료",
        description: `${relationshipData.relationshipType} 관계에 대한 맞춤 조언을 받았습니다.`,
      });

      return data;
    } catch (error) {
      console.error('Error analyzing relationship:', error);
      toast({
        title: "오류",
        description: "관계 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentProfile, toast]);

  // Get lifestyle coaching
  const getLifestyleCoaching = useCallback(async (lifestyleData: LifestyleData) => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfile();

      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          action: 'lifestyle_coaching',
          profileId,
          lifestyleData,
        },
      });

      if (error) throw error;

      toast({
        title: "라이프스타일 코칭",
        description: "개인 맞춤 건강 관리 조언을 받았습니다.",
      });

      return data;
    } catch (error) {
      console.error('Error getting lifestyle coaching:', error);
      toast({
        title: "오류",
        description: "라이프스타일 코칭 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentProfile, toast]);

  // Get personalized intervention for crisis
  const getPersonalizedIntervention = useCallback(async (emotionData: EmotionData) => {
    try {
      setLoading(true);
      const profileId = await getCurrentProfile();

      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          action: 'get_personalized_intervention',
          profileId,
          emotionData,
        },
      });

      if (error) throw error;

      if (data.riskAssessment === 'high') {
        toast({
          title: "긴급 상황 감지",
          description: "즉시 대처법을 확인하세요. 필요시 전문가 도움을 받으세요.",
          variant: "destructive",
          duration: 10000,
        });
      }

      return data;
    } catch (error) {
      console.error('Error getting personalized intervention:', error);
      toast({
        title: "오류",
        description: "개인 맞춤 개입 방법을 가져올 수 없습니다.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentProfile, toast]);

  // Fetch conversation history
  const fetchConversations = useCallback(async () => {
    try {
      const profileId = await getCurrentProfile();
      const { data, error } = await supabase
        .from('ai_coach_conversations')
        .select('*')
        .eq('profile_id', profileId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const mappedConversations: ConversationMessage[] = (data || []).map(msg => ({
        id: msg.id,
        messageType: msg.message_type as 'user' | 'ai_coach',
        content: msg.content,
        timestamp: msg.timestamp,
        emotionDetected: msg.emotion_detected,
        interventionType: msg.intervention_type,
      }));
      
      setConversations(mappedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [getCurrentProfile]);

  // Fetch CBT homework
  const fetchCBTHomework = useCallback(async () => {
    try {
      const profileId = await getCurrentProfile();
      const { data, error } = await supabase
        .from('cbt_homework_assignments')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedHomework: CBTHomework[] = (data || []).map(hw => ({
        id: hw.id,
        assignmentType: hw.assignment_type as 'thought_record' | 'behavior_experiment' | 'exposure_exercise',
        title: hw.title,
        description: hw.description,
        instructions: hw.instructions,
        dueDate: hw.due_date,
        completionStatus: hw.completion_status as 'pending' | 'in_progress' | 'completed' | 'skipped',
        difficultyLevel: hw.difficulty_level,
      }));
      
      setCbtHomework(mappedHomework);
    } catch (error) {
      console.error('Error fetching CBT homework:', error);
    }
  }, [getCurrentProfile]);

  // Fetch emotion logs
  const fetchEmotionLogs = useCallback(async () => {
    try {
      const profileId = await getCurrentProfile();
      const { data, error } = await supabase
        .from('emotion_monitoring_logs')
        .select('*')
        .eq('profile_id', profileId)
        .order('detection_timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmotionLogs(data || []);
    } catch (error) {
      console.error('Error fetching emotion logs:', error);
    }
  }, [getCurrentProfile]);

  // Complete CBT homework
  const completeCBTHomework = useCallback(async (homeworkId: string, completionData: any, userFeedback: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('cbt_homework_assignments')
        .update({
          completion_status: 'completed',
          completion_data: completionData,
          completed_at: new Date().toISOString(),
        })
        .eq('id', homeworkId);

      if (error) throw error;

      await fetchCBTHomework();

      toast({
        title: "숙제 완료",
        description: "CBT 숙제를 성공적으로 완료했습니다!",
      });
    } catch (error) {
      console.error('Error completing CBT homework:', error);
      toast({
        title: "오류",
        description: "숙제 완료 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // End coaching session
  const endCoachingSession = useCallback(async (effectivenessScore: number) => {
    if (!currentSession) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('ai_coach_sessions')
        .update({
          end_time: new Date().toISOString(),
          effectiveness_score: effectivenessScore,
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      setCurrentSession(null);
      toast({
        title: "세션 종료",
        description: "코칭 세션이 성공적으로 종료되었습니다.",
      });
    } catch (error) {
      console.error('Error ending coaching session:', error);
      toast({
        title: "오류",
        description: "세션 종료 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentSession, toast]);

  // Helper function to get session type label
  const getSessionTypeLabel = (sessionType: CoachingSession['sessionType']) => {
    const labels = {
      emotion_monitoring: '감정 모니터링',
      cbt_coaching: 'CBT 코칭',
      relationship_coaching: '관계 개선',
      lifestyle_coaching: '라이프스타일 코칭',
    };
    return labels[sessionType] || sessionType;
  };

  return {
    // State
    loading,
    currentSession,
    conversations,
    cbtHomework,
    emotionLogs,

    // Actions
    startCoachingSession,
    endCoachingSession,
    analyzeEmotion,
    chatWithCoach,
    generateCBTHomework,
    completeCBTHomework,
    analyzeRelationship,
    getLifestyleCoaching,
    getPersonalizedIntervention,

    // Fetch functions
    fetchConversations,
    fetchCBTHomework,
    fetchEmotionLogs,

    // Utilities
    getSessionTypeLabel,
  };
}
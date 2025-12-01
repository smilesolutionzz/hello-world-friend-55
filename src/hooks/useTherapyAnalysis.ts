import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TherapyAnalysisRequest {
  sessionId: string;
  therapistType: string;
  conversationHistory: ConversationMessage[];
  userConcern: string;
  moodBefore?: number;
  moodAfter?: number;
}

export const useTherapyAnalysis = () => {
  const { toast } = useToast();

  const analyzeSession = async (request: TherapyAnalysisRequest) => {
    try {
      console.log('[useTherapyAnalysis] Starting session analysis:', request.sessionId);

      const { data, error } = await supabase.functions.invoke('analyze-therapy-session', {
        body: {
          ...request,
          conversationHistory: request.conversationHistory.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }))
        }
      });

      if (error) {
        console.error('[useTherapyAnalysis] Analysis error:', error);
        throw error;
      }

      console.log('[useTherapyAnalysis] Analysis complete:', data);

      toast({
        title: '세션 분석 완료',
        description: '치료 세션이 분석되어 기록에 저장되었습니다.',
      });

      return data.analysis;
    } catch (error) {
      console.error('[useTherapyAnalysis] Failed to analyze session:', error);
      toast({
        title: '분석 실패',
        description: '세션 분석 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const createNewSession = async (therapistType: string, userConcern: string, moodBefore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      // 이전 세션 번호 확인
      const { data: previousSessions } = await supabase
        .from('therapy_sessions')
        .select('session_number')
        .eq('user_id', user.id)
        .eq('therapist_type', therapistType)
        .order('session_number', { ascending: false })
        .limit(1);

      const nextSessionNumber = previousSessions && previousSessions.length > 0 
        ? previousSessions[0].session_number + 1 
        : 1;

      const { data: newSession, error } = await supabase
        .from('therapy_sessions')
        .insert({
          user_id: user.id,
          therapist_type: therapistType,
          session_number: nextSessionNumber,
          user_concern: userConcern,
          mood_before: moodBefore
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[useTherapyAnalysis] New session created:', newSession.id);
      return newSession;
    } catch (error) {
      console.error('[useTherapyAnalysis] Failed to create session:', error);
      toast({
        title: '세션 생성 실패',
        description: '치료 세션을 시작하는데 실패했습니다.',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    analyzeSession,
    createNewSession
  };
};

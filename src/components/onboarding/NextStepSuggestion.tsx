import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Brain, 
  ClipboardList, 
  MessageCircle, 
  FileText,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface NextStepSuggestionProps {
  className?: string;
}

export function NextStepSuggestion({ className }: NextStepSuggestionProps) {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthGuard();

  useEffect(() => {
    if (user) {
      analyzeUserProgress();
    }
  }, [user]);

  const analyzeUserProgress = async () => {
    if (!user) return;

    try {
      // 사용자의 활동 데이터 조회
      const [assessments, observations, chatRooms] = await Promise.all([
        supabase.from('assessments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('observation_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('chat_rooms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
      ]);

      const hasAssessment = (assessments.data?.length || 0) > 0;
      const observationCount = observations.data?.length || 0;
      const hasChatRoom = (chatRooms.data?.length || 0) > 0;

      // 다음 단계 제안 로직
      let nextStep = null;

      if (!hasAssessment) {
        // 검사를 한 번도 안 했으면
        nextStep = {
          type: 'assessment',
          title: '첫 검사로 시작해보세요',
          description: '현재 심리상태를 파악하는 것부터 시작해보세요',
          icon: <Brain className="w-5 h-5" />,
          action: '검사 시작하기',
          route: '/assessment',
          badge: '3분 소요',
          priority: 'high'
        };
      } else if (observationCount === 0) {
        // 검사는 했는데 관찰일지가 없으면
        nextStep = {
          type: 'observation',
          title: '관찰일지로 패턴 찾기',
          description: '검사 결과를 바탕으로 일상의 패턴을 기록해보세요',
          icon: <ClipboardList className="w-5 h-5" />,
          action: '관찰일지 작성',
          route: '/observation',
          badge: '매일 기록',
          priority: 'medium'
        };
      } else if (observationCount >= 3 && !hasChatRoom) {
        // 관찰일지가 3개 이상인데 AI 상담을 안 했으면
        nextStep = {
          type: 'ai_counseling',
          title: 'AI 상담으로 깊이 분석하기',
          description: '축적된 데이터를 바탕으로 AI 전문가와 상담해보세요',
          icon: <MessageCircle className="w-5 h-5" />,
          action: 'AI 상담 시작',
          route: '/ai-counselor',
          badge: '맞춤 분석',
          priority: 'high'
        };
      } else if (hasAssessment && observationCount >= 2 && hasChatRoom) {
        // 모든 활동을 어느 정도 했으면 종합 리포팅 제안
        nextStep = {
          type: 'comprehensive_report',
          title: '종합 리포팅 받아보기',
          description: '지금까지의 모든 데이터를 종합한 전문가 분석을 받아보세요',
          icon: <FileText className="w-5 h-5" />,
          action: '종합 리포팅 신청',
          route: '/dashboard',
          badge: '전문가 분석',
          priority: 'high'
        };
      }

      setSuggestion(nextStep);
    } catch (error) {
      console.error('Error analyzing user progress:', error);
    }
  };

  const handleAction = () => {
    if (suggestion?.route) {
      navigate(suggestion.route);
      // 클릭 후 숨기기
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // 하루 동안 숨기기
    if (user && suggestion) {
      localStorage.setItem(`suggestion_dismissed_${user.id}_${suggestion.type}`, Date.now().toString());
    }
  };

  // 이미 dismiss된 제안인지 확인
  useEffect(() => {
    if (user && suggestion) {
      const dismissedTime = localStorage.getItem(`suggestion_dismissed_${user.id}_${suggestion.type}`);
      if (dismissedTime) {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (parseInt(dismissedTime) > oneDayAgo) {
          setIsVisible(false);
        }
      }
    }
  }, [user, suggestion]);

  if (!suggestion || !isVisible) return null;

  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-primary-glow/10 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {suggestion.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                <Badge 
                  variant={suggestion.priority === 'high' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {suggestion.badge}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {suggestion.description}
              </p>
              <Button 
                onClick={handleAction}
                size="sm"
                className="h-8"
              >
                {suggestion.action}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 flex-shrink-0 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
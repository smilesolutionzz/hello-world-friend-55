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
  X,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/hooks/use-toast';

interface NextStepSuggestionProps {
  className?: string;
}

interface Suggestion {
  type: string;
  title: string;
  description: string;
  action: string;
  route: string;
  badge: string;
  priority: 'high' | 'medium' | 'low';
  reasoning?: string;
  expectedBenefit?: string;
  icon?: React.ReactNode;
}

export function NextStepSuggestion({ className }: NextStepSuggestionProps) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAIPersonalizedSuggestion();
    }
  }, [user]);

  const fetchAIPersonalizedSuggestion = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalized-suggestions', {
        body: { userId: user.id }
      });

      if (error) throw error;

      if (data?.suggestion) {
        const suggestionWithIcon = {
          ...data.suggestion,
          icon: getIconForType(data.suggestion.type)
        };
        setSuggestion(suggestionWithIcon);
      }
    } catch (error) {
      console.error('Error fetching AI suggestion:', error);
      // Fallback to basic suggestion
      await fetchBasicSuggestion();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBasicSuggestion = async () => {
    if (!user) return;

    try {
      const [assessments, observations] = await Promise.all([
        supabase.from('assessments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('observation_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      const hasAssessment = (assessments.data?.length || 0) > 0;
      const observationCount = observations.data?.length || 0;

      let nextStep: Suggestion | null = null;

      if (!hasAssessment) {
        nextStep = {
          type: 'assessment',
          title: '첫 검사로 시작하기',
          description: '현재 심리상태 파악부터 시작해보세요',
          icon: <Brain className="w-5 h-5" />,
          action: '검사 시작',
          route: '/assessment',
          badge: '3분',
          priority: 'high'
        };
      } else if (observationCount < 3) {
        nextStep = {
          type: 'observation',
          title: '관찰일지 작성하기',
          description: '일상 패턴을 기록하고 인사이트를 얻으세요',
          icon: <ClipboardList className="w-5 h-5" />,
          action: '일지 작성',
          route: '/observation',
          badge: '매일',
          priority: 'medium'
        };
      } else {
        nextStep = {
          type: 'ai_counseling',
          title: 'AI 상담 받기',
          description: '축적된 데이터로 깊이 있는 분석 받기',
          icon: <MessageCircle className="w-5 h-5" />,
          action: 'AI 상담',
          route: '/ai-counselor',
          badge: '맞춤',
          priority: 'high'
        };
      }

      setSuggestion(nextStep);
    } catch (error) {
      console.error('Error fetching basic suggestion:', error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'assessment':
        return <Brain className="w-5 h-5" />;
      case 'observation':
        return <ClipboardList className="w-5 h-5" />;
      case 'ai_counseling':
        return <MessageCircle className="w-5 h-5" />;
      case 'challenge':
        return <TrendingUp className="w-5 h-5" />;
      case 'comprehensive_report':
        return <FileText className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const VALID_ROUTES = ['/assessment', '/observation', '/ai-counselor', '/expert-hiring', '/daily-checkin', '/wellness-hub', '/dashboard', '/metaverse-voice', '/token-subscription'];

  const handleAction = () => {
    if (suggestion?.route) {
      const route = VALID_ROUTES.includes(suggestion.route) ? suggestion.route : '/assessment';
      navigate(route);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (user && suggestion) {
      localStorage.setItem(`suggestion_dismissed_${user.id}_${suggestion.type}`, Date.now().toString());
    }
  };

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

  if (isLoading) return null;
  if (!suggestion || !isVisible) return null;

  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-primary-glow/10 border-primary/20 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 text-primary">
              {suggestion.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                </div>
                <Badge 
                  variant={suggestion.priority === 'high' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {suggestion.badge}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {suggestion.description}
              </p>
              {suggestion.reasoning && (
                <p className="text-xs text-muted-foreground/80 mb-3 italic">
                  💡 {suggestion.reasoning}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleAction}
                  size="sm"
                  className="h-8 bg-primary hover:bg-primary/90"
                >
                  {suggestion.action}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                {suggestion.expectedBenefit && (
                  <span className="text-xs text-primary font-medium flex items-center gap-1 px-2">
                    <TrendingUp className="w-3 h-3" />
                    {suggestion.expectedBenefit}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 flex-shrink-0"
            aria-label="추천 닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
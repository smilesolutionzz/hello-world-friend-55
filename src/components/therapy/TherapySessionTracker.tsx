import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Activity,
  Sparkles
} from 'lucide-react';
import type { TherapistType } from '@/types/therapist';
import { getTherapistProfile } from '@/utils/TherapistProfiles';

interface TherapySession {
  id: string;
  session_number: number;
  session_date: string;
  mood_before: number;
  mood_after: number;
  progress_rating: number;
  key_insights: string[];
  homework_assigned: string[];
  next_session_goals: string[];
  therapist_observations: string;
}

interface TherapyGoal {
  id: string;
  goal_title: string;
  goal_description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'achieved' | 'on_hold';
  progress_percentage: number;
  target_date: string;
}

interface TherapyInsight {
  id: string;
  insight_type: 'pattern' | 'breakthrough' | 'concern' | 'strength' | 'homework_compliance';
  insight_content: string;
  confidence_score: number;
  created_at: string;
}

interface TherapySessionTrackerProps {
  therapistType: TherapistType;
}

export const TherapySessionTracker = ({ therapistType }: TherapySessionTrackerProps) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [goals, setGoals] = useState<TherapyGoal[]>([]);
  const [insights, setInsights] = useState<TherapyInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const therapistProfile = getTherapistProfile(therapistType);

  useEffect(() => {
    loadTherapyData();
  }, [therapistType]);

  const loadTherapyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 세션 로드
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('therapist_type', therapistType)
        .order('session_date', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // 목표 로드
      const { data: goalsData, error: goalsError } = await supabase
        .from('therapy_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('therapist_type', therapistType)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      setGoals((goalsData as any) || []);

      // 최근 인사이트 로드
      if (sessionsData && sessionsData.length > 0) {
        const sessionIds = sessionsData.map(s => s.id);
        const { data: insightsData, error: insightsError } = await supabase
          .from('therapy_insights')
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: false })
          .limit(20);

        if (insightsError) throw insightsError;
        setInsights((insightsData as any) || []);
      }

    } catch (error) {
      console.error('치료 데이터 로드 오류:', error);
      toast({
        title: '데이터 로드 실패',
        description: '치료 기록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodTrend = () => {
    if (sessions.length < 2) return 0;
    const recent = sessions.slice(0, 3);
    const avg = recent.reduce((sum, s) => sum + (s.mood_after - s.mood_before), 0) / recent.length;
    return Math.round(avg * 10) / 10;
  };

  const getProgressTrend = () => {
    if (sessions.length < 2) return 0;
    const recent = sessions.slice(0, 5);
    const avg = recent.reduce((sum, s) => sum + s.progress_rating, 0) / recent.length;
    return Math.round(avg * 10) / 10;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'not_started': return 'bg-gray-500';
      case 'on_hold': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'breakthrough': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'pattern': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'strength': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'concern': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">로딩중...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <div className="text-4xl">{therapistProfile.icon}</div>
        <div>
          <h2 className="text-2xl font-bold">{therapistProfile.nameKo} 치료 기록</h2>
          <p className="text-muted-foreground">{therapistProfile.description}</p>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              총 세션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">완료된 세션</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              기분 변화
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getMoodTrend() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getMoodTrend() >= 0 ? '+' : ''}{getMoodTrend()}
            </div>
            <p className="text-xs text-muted-foreground">평균 개선도</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              진척도
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{getProgressTrend()}/5</div>
            <p className="text-xs text-muted-foreground">평균 평가</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              달성 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {goals.filter(g => g.status === 'achieved').length}/{goals.length}
            </div>
            <p className="text-xs text-muted-foreground">완료된 목표</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 콘텐츠 */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">핵심 인사이트</TabsTrigger>
          <TabsTrigger value="goals">치료 목표</TabsTrigger>
          <TabsTrigger value="sessions">세션 기록</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI 분석 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  아직 인사이트가 없습니다. 세션을 진행하면 AI가 자동으로 분석합니다.
                </p>
              ) : (
                insights.map(insight => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    {getInsightIcon(insight.insight_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.insight_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          신뢰도: {Math.round(insight.confidence_score * 100)}%
                        </span>
                      </div>
                      <p className="text-sm">{insight.insight_content}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  설정된 치료 목표가 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            goals.map(goal => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.goal_title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {goal.goal_description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>진행률</span>
                      <span className="font-medium">{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} />
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground">
                        목표일: {new Date(goal.target_date).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  아직 진행한 세션이 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            sessions.map(session => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      세션 #{session.session_number}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(session.session_date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 기분 변화 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">세션 전 기분</p>
                      <p className="text-2xl font-bold">{session.mood_before}/10</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">세션 후 기분</p>
                      <p className="text-2xl font-bold text-green-500">
                        {session.mood_after}/10
                      </p>
                    </div>
                  </div>

                  {/* 치료사 관찰 */}
                  {session.therapist_observations && (
                    <div>
                      <p className="text-sm font-medium mb-1">치료사 관찰</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {session.therapist_observations}
                      </p>
                    </div>
                  )}

                  {/* 핵심 인사이트 */}
                  {session.key_insights && session.key_insights.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">핵심 인사이트</p>
                      <ul className="space-y-1">
                        {session.key_insights.map((insight, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 과제 */}
                  {session.homework_assigned && session.homework_assigned.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">부여된 과제</p>
                      <ul className="space-y-1">
                        {session.homework_assigned.map((hw, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span>{hw}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 진척도 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">진척도 평가:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= session.progress_rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
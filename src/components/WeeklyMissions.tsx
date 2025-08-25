import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Heart,
  Dumbbell,
  Coffee,
  Moon,
  Brain,
  Star,
  Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  week_start_date: string;
}

interface MissionProgress {
  id: string;
  mission_id: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

const categoryIcons = {
  health: Heart,
  mental_health: Brain,
  diet: Coffee,
  exercise: Dumbbell,
  lifestyle: Moon
};

const categoryColors = {
  health: 'text-red-500',
  mental_health: 'text-purple-500',
  diet: 'text-green-500',
  exercise: 'text-blue-500',
  lifestyle: 'text-indigo-500'
};

const difficultyInfo = {
  easy: { label: '쉬움', color: 'bg-green-100 text-green-800' },
  medium: { label: '보통', color: 'bg-yellow-100 text-yellow-800' },
  hard: { label: '어려움', color: 'bg-red-100 text-red-800' }
};

export const WeeklyMissions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, MissionProgress>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMissionNotes, setSelectedMissionNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setLoading(false);
        return;
      }

      // 1. 먼저 개인화된 미션 생성 시도
      await generatePersonalizedMissions(user.user.id);

      // 2. 현재 주 미션 로드
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay() + 1);
      const weekStartString = currentWeekStart.toISOString().split('T')[0];

      const { data: missionsData, error: missionsError } = await supabase
        .from('weekly_missions')
        .select('*')
        .eq('week_start_date', weekStartString)
        .eq('is_active', true);

      if (missionsError) throw missionsError;

      if (missionsData && missionsData.length > 0) {
        setMissions(missionsData);

        // Load user progress for these missions
        const missionIds = missionsData.map(m => m.id);
        const { data: progressData, error: progressError } = await supabase
          .from('user_mission_progress')
          .select('*')
          .eq('user_id', user.user.id)
          .in('mission_id', missionIds);

        if (progressError) throw progressError;

        const progressMap: Record<string, MissionProgress> = {};
        progressData?.forEach(p => {
          progressMap[p.mission_id] = p;
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('미션 로드 오류:', error);
      toast({
        title: "오류 발생",
        description: "미션을 불러올 수 없습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedMissions = async (userId: string) => {
    try {
      console.log('🤖 개인화된 미션 생성 중...');
      
      const { data, error } = await supabase.functions.invoke('generate-personalized-missions', {
        body: { 
          userId,
          forceGenerate: false
        }
      });

      if (error) {
        console.warn('개인화 미션 생성 실패:', error);
        return;
      }

      if (data?.success) {
        console.log('✅ 개인화된 미션 생성 완료:', data.message);
        toast({
          title: "🎯 맞춤 미션 준비 완료!",
          description: data.message,
        });
      }
    } catch (error) {
      console.warn('개인화 미션 생성 중 오류:', error);
      // 실패해도 기존 미션은 표시되도록 에러를 throw하지 않음
    }
  };

  const toggleMissionCompletion = async (mission: Mission) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "로그인 필요",
          description: "미션을 완료하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const currentProgress = userProgress[mission.id];
      const isCompleted = !currentProgress?.is_completed;
      const notes = selectedMissionNotes[mission.id] || '';

      if (currentProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_mission_progress')
          .update({
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            notes: notes || null
          })
          .eq('id', currentProgress.id);

        if (error) throw error;
      } else {
        // Create new progress
        const { error } = await supabase
          .from('user_mission_progress')
          .insert({
            user_id: user.user.id,
            mission_id: mission.id,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            notes: notes || null
          });

        if (error) throw error;
      }

      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [mission.id]: {
          ...currentProgress,
          mission_id: mission.id,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          notes: notes || null
        } as MissionProgress
      }));

      // Clear notes input
      setSelectedMissionNotes(prev => ({
        ...prev,
        [mission.id]: ''
      }));

      toast({
        title: isCompleted ? "미션 완료!" : "미션 취소",
        description: isCompleted 
          ? `${mission.points}포인트를 획득했습니다!` 
          : "미션이 취소되었습니다.",
      });
    } catch (error) {
      console.error('미션 상태 업데이트 오류:', error);
      toast({
        title: "오류 발생",
        description: "미션 상태를 업데이트할 수 없습니다.",
        variant: "destructive"
      });
    }
  };

  const completedMissions = Object.values(userProgress).filter(p => p.is_completed).length;
  const totalPoints = Object.values(userProgress)
    .filter(p => p.is_completed)
    .reduce((sum, p) => {
      const mission = missions.find(m => m.id === p.mission_id);
      return sum + (mission?.points || 0);
    }, 0);

  const progressPercentage = missions.length > 0 ? (completedMissions / missions.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">미션을 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 미션 진행 상황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            이번 주 미션
          </CardTitle>
          <CardDescription>
            건강한 생활습관을 위한 주간 도전과제
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">완료: {completedMissions}/{missions.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">{totalPoints} 포인트</span>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>주간 미션</span>
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>진행률</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {progressPercentage === 100 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-amber-500" />
                  <span className="font-medium text-amber-800">
                    축하합니다! 이번 주 모든 미션을 완료했습니다! 🎉
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 미션 목록 */}
      <div className="grid gap-4">
        {missions.map((mission) => {
          const progress = userProgress[mission.id];
          const isCompleted = progress?.is_completed || false;
          const CategoryIcon = categoryIcons[mission.category as keyof typeof categoryIcons] || Target;
          const categoryColor = categoryColors[mission.category as keyof typeof categoryColors];
          const difficultyColor = difficultyInfo[mission.difficulty as keyof typeof difficultyInfo];

          return (
            <Card key={mission.id} className={`transition-all duration-200 ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleMissionCompletion(mission)}
                      className="transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className={`h-4 w-4 ${categoryColor}`} />
                          <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {mission.title}
                          </h4>
                        </div>
                        <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {mission.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={difficultyColor.color}>
                          {difficultyColor.label}
                        </Badge>
                        <Badge variant="outline" className="text-purple-600">
                          {mission.points}P
                        </Badge>
                      </div>
                    </div>

                    {/* 완료 시 메모 입력 */}
                    {!isCompleted && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="미션 완료 후 느낀 점이나 경험을 메모해보세요 (선택사항)"
                          value={selectedMissionNotes[mission.id] || ''}
                          onChange={(e) => setSelectedMissionNotes(prev => ({
                            ...prev,
                            [mission.id]: e.target.value
                          }))}
                          rows={2}
                          className="text-sm"
                        />
                        <Button 
                          onClick={() => toggleMissionCompletion(mission)}
                          size="sm"
                          className="w-full"
                        >
                          미션 완료하기
                        </Button>
                      </div>
                    )}

                    {/* 완료된 미션의 메모 표시 */}
                    {isCompleted && progress?.notes && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <strong>완료 메모:</strong> {progress.notes}
                        </p>
                      </div>
                    )}

                    {/* 완료 시간 표시 */}
                    {isCompleted && progress?.completed_at && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>
                          완료: {new Date(progress.completed_at).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {missions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              이번 주 미션이 아직 준비되지 않았습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
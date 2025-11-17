import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Target, CheckCircle2, Circle, Plus, Trash2, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Goal {
  id: string;
  goal_text: string;
  category: string | null;
  target_date: string | null;
  is_completed: boolean;
  priority: string;
  created_at: string;
  progress?: number;
}

export const GoalTracker = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    goal_text: "",
    category: "",
    target_date: "",
    priority: "medium"
  });
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('life_achievement_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 각 목표의 최신 진행률 가져오기
      const goalsWithProgress = await Promise.all(
        (data || []).map(async (goal) => {
          const { data: progressData } = await supabase
            .from('life_achievement_goal_progress')
            .select('progress_percentage')
            .eq('goal_id', goal.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...goal,
            progress: progressData?.progress_percentage || 0
          };
        })
      );

      setGoals(goalsWithProgress);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!newGoal.goal_text.trim()) {
        toast({
          title: "목표를 입력해주세요",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('life_achievement_goals')
        .insert({
          user_id: user.id,
          goal_text: newGoal.goal_text,
          category: newGoal.category || null,
          target_date: newGoal.target_date || null,
          priority: newGoal.priority
        });

      if (error) throw error;

      toast({
        title: "목표가 추가되었습니다! 🎯"
      });

      setNewGoal({ goal_text: "", category: "", target_date: "", priority: "medium" });
      setShowDialog(false);
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "목표 추가 실패",
        variant: "destructive"
      });
    }
  };

  const toggleGoalCompletion = async (goalId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('life_achievement_goals')
        .update({
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "목표 달성! 🎉" : "목표를 다시 활성화했습니다"
      });

      loadGoals();
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('life_achievement_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "목표가 삭제되었습니다"
      });

      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const updateProgress = async (goalId: string, progress: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('life_achievement_goal_progress')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          progress_percentage: progress
        });

      if (error) throw error;

      toast({
        title: `진행률이 ${progress}%로 업데이트되었습니다`
      });

      loadGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="text-muted-foreground">목표를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">내 목표</h2>
          <p className="text-muted-foreground">
            {goals.length}개의 목표가 진행중입니다
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="h-5 w-5 mr-2" />
              새 목표 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새로운 목표 추가</DialogTitle>
              <DialogDescription>
                달성하고 싶은 목표를 설정하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal">목표</Label>
                <Textarea
                  id="goal"
                  value={newGoal.goal_text}
                  onChange={(e) => setNewGoal({ ...newGoal, goal_text: e.target.value })}
                  placeholder="예: 매일 30분 운동하기"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">카테고리 (선택)</Label>
                <Input
                  id="category"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  placeholder="예: 건강"
                />
              </div>
              <div>
                <Label htmlFor="priority">우선순위</Label>
                <Select
                  value={newGoal.priority}
                  onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">높음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target_date">목표 달성일 (선택)</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>
              <Button onClick={createGoal} className="w-full">
                목표 추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-dashed">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
            <div className="relative p-12 text-center space-y-6">
              <div className="inline-flex p-4 rounded-full bg-primary/10">
                <Target className="h-12 w-12 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">아직 목표가 없습니다</h3>
                <p className="text-muted-foreground text-lg">
                  첫 번째 목표를 설정하고 성장을 시작하세요!
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card 
              key={goal.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                goal.is_completed ? 'opacity-75' : ''
              }`}
            >
              {/* Progress Background */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-all"
                style={{ opacity: goal.progress / 200 }}
              />
              
              <div className="relative p-6 space-y-4">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(goal.priority)} font-medium`}
                      >
                        {getPriorityLabel(goal.priority)}
                      </Badge>
                      <Badge variant="secondary" className="font-medium">
                        {goal.category}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>

                  <h3 className={`text-lg font-semibold leading-tight ${
                    goal.is_completed ? 'line-through text-muted-foreground' : ''
                  }`}>
                    {goal.goal_text}
                  </h3>

                  {goal.target_date && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(goal.target_date), 'yyyy년 M월 d일', { locale: ko })}
                    </p>
                  )}
                </div>

                {/* Progress Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">진행률</span>
                    <span className="text-lg font-bold text-primary">{goal.progress}%</span>
                  </div>
                  
                  <Progress 
                    value={goal.progress} 
                    className="h-3 bg-secondary"
                  />

                  {/* Progress Input */}
                  <div className="flex gap-2 pt-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="진행률 입력"
                      className="flex-1 h-9"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(value) && value >= 0 && value <= 100) {
                            updateProgress(goal.id, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      variant={goal.is_completed ? "default" : "outline"}
                      className="h-9 w-9 shrink-0"
                      onClick={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                    >
                      {goal.is_completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
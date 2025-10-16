import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    goal_text: "",
    category: "",
    target_date: "",
    priority: "medium"
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      setLoading(false);
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
      setIsDialogOpen(false);
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

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            나의 목표
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            목표를 설정하고 진행상황을 추적하세요
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 목표
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
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 설정된 목표가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              새 목표를 추가하여 시작해보세요!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id} className={goal.is_completed ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                      >
                        {goal.is_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      <CardTitle className={goal.is_completed ? 'line-through' : ''}>
                        {goal.goal_text}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 ml-11">
                      <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                        {getPriorityLabel(goal.priority)}
                      </Badge>
                      {goal.category && (
                        <Badge variant="outline">{goal.category}</Badge>
                      )}
                      {goal.target_date && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(goal.target_date).toLocaleDateString('ko-KR')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {!goal.is_completed && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        onClick={() => updateProgress(goal.id, value)}
                        disabled={goal.progress >= value}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
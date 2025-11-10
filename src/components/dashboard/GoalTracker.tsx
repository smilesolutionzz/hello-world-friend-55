import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Calendar, Trash2, Edit, CheckCircle2, Pause, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  category: string;
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: '',
    category: '',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('development_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data || []) as Goal[]);
    } catch (error: any) {
      toast({
        title: "목표 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const goalData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        target_value: parseInt(formData.target_value),
        category: formData.category,
        deadline: formData.deadline || null,
      };

      if (editingGoal) {
        const { error } = await supabase
          .from('development_goals')
          .update(goalData)
          .eq('id', editingGoal.id);

        if (error) throw error;
        
        toast({
          title: "목표 수정 완료",
          description: "목표가 성공적으로 수정되었습니다.",
        });
      } else {
        const { error } = await supabase
          .from('development_goals')
          .insert([goalData]);

        if (error) throw error;
        
        toast({
          title: "목표 생성 완료",
          description: "새로운 목표가 생성되었습니다.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadGoals();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('development_goals')
        .update({ 
          current_value: newValue,
          status: newValue >= goals.find(g => g.id === goalId)?.target_value! ? 'completed' : 'active'
        })
        .eq('id', goalId);

      if (error) throw error;
      
      loadGoals();
      toast({
        title: "진행도 업데이트",
        description: "목표 진행도가 업데이트되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('development_goals')
        .update({ status: newStatus })
        .eq('id', goal.id);

      if (error) throw error;
      
      loadGoals();
    } catch (error: any) {
      toast({
        title: "상태 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('development_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      
      loadGoals();
      toast({
        title: "목표 삭제",
        description: "목표가 삭제되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_value: '',
      category: '',
      deadline: '',
    });
    setEditingGoal(null);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_value: goal.target_value.toString(),
      category: goal.category,
      deadline: goal.deadline || '',
    });
    setIsDialogOpen(true);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              발달 목표 추적
            </CardTitle>
            <CardDescription className="text-slate-400">
              목표를 설정하고 진행 상황을 추적하세요
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                목표 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingGoal ? '목표 수정' : '새 목표 추가'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  발달 목표를 설정하고 추적하세요
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-300">목표 제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: 월 5회 검사 완료"
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-slate-300">설명 (선택)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="목표에 대한 자세한 설명"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-slate-300">카테고리</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="cognitive">인지 발달</SelectItem>
                      <SelectItem value="emotional">정서 발달</SelectItem>
                      <SelectItem value="social">사회성 발달</SelectItem>
                      <SelectItem value="physical">신체 발달</SelectItem>
                      <SelectItem value="behavior">행동 개선</SelectItem>
                      <SelectItem value="assessment">검사 횟수</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target_value" className="text-slate-300">목표 값</Label>
                  <Input
                    id="target_value"
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="10"
                    required
                    min="1"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline" className="text-slate-300">마감일 (선택)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingGoal ? '수정' : '추가'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    취소
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-slate-400">로딩 중...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-2">아직 설정한 목표가 없습니다</p>
            <p className="text-sm text-slate-500">첫 목표를 추가해보세요!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGoals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">진행 중인 목표</h3>
                <div className="space-y-4">
                  {activeGoals.map((goal) => {
                    const progress = (goal.current_value / goal.target_value) * 100;
                    return (
                      <div key={goal.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">{goal.title}</h4>
                            {goal.description && (
                              <p className="text-sm text-slate-400 mb-2">{goal.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="px-2 py-1 bg-slate-700 rounded">{goal.category}</span>
                              {goal.deadline && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(goal.deadline), 'yyyy년 MM월 dd일', { locale: ko })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleStatus(goal)}
                              className="text-slate-400 hover:text-slate-300"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(goal)}
                              className="text-slate-400 hover:text-slate-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteGoal(goal.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">
                              {goal.current_value} / {goal.target_value}
                            </span>
                            <span className="font-medium text-blue-400">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProgress(goal.id, Math.max(0, goal.current_value - 1))}
                              disabled={goal.current_value === 0}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              -
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProgress(goal.id, Math.min(goal.target_value, goal.current_value + 1))}
                              disabled={goal.current_value >= goal.target_value}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800 flex-1"
                            >
                              진행도 +1
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProgress(goal.id, goal.current_value + 1)}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  완료된 목표
                </h3>
                <div className="space-y-2">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-green-400">{goal.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {goal.current_value} / {goal.target_value} 달성
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-slate-400 hover:text-slate-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

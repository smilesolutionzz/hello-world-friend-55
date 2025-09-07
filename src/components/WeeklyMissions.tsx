import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Camera, 
  Trophy, 
  Calendar,
  Target,
  Sparkles,
  Upload,
  Gift,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/hooks/use-toast';

interface Mission {
  id: string;
  mission_title: string;
  mission_description: string;
  target_behavior: string;
  difficulty_level: number;
  day_of_week: number;
  is_completed: boolean;
  completed_at?: string;
  verification_photo_url?: string;
  verification_note?: string;
  week_start: string;
  week_end: string;
}

interface WeeklyCompletion {
  completed_missions: number;
  total_missions: number;
  is_week_completed: boolean;
  tokens_awarded: number;
}

const WeeklyMissions: React.FC = () => {
  const { user } = useAuthGuard();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingMissions, setGeneratingMissions] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      loadWeeklyMissions();
      loadWeeklyStats();
    }
  }, [user]);

  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0]
    };
  };

  const loadWeeklyMissions = async () => {
    if (!user) return;
    
    try {
      const { start } = getCurrentWeekDates();
      
      const { data, error } = await supabase
        .from('personalized_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', start)
        .order('day_of_week');

      if (error) throw error;
      
      setMissions(data || []);
      
      // If no missions exist, generate them
      if (!data || data.length === 0) {
        await generateWeeklyMissions();
      }
    } catch (error) {
      console.error('Error loading weekly missions:', error);
      toast({
        title: '오류',
        description: '주간 미션을 불러올 수 없습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyStats = async () => {
    if (!user) return;
    
    try {
      const { start } = getCurrentWeekDates();
      
      const { data, error } = await supabase
        .from('weekly_mission_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', start)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setWeeklyStats(data || { completed_missions: 0, total_missions: 7, is_week_completed: false, tokens_awarded: 0 });
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    }
  };

  const generateWeeklyMissions = async (regenerate = false) => {
    if (!user) return;
    
    setGeneratingMissions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-personalized-missions', {
        body: { user_id: user.id, regenerate }
      });

      if (error) throw error;
      
      if (data.success) {
        setMissions(data.missions);
        toast({
          title: '미션 생성 완료! 🎯',
          description: data.message,
        });
        await loadWeeklyStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating missions:', error);
      toast({
        title: '미션 생성 실패',
        description: '미션을 생성할 수 없습니다. 다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingMissions(false);
    }
  };

  const uploadVerificationPhoto = async (file: File, missionId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${missionId}_${Date.now()}.${fileExt}`;
    const filePath = `mission-verifications/${user?.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('observation-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('observation-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const completeMission = async (mission: Mission) => {
    if (!user || !photoFile) return;
    
    setUploadingPhoto(mission.id);
    try {
      // Upload verification photo
      const photoUrl = await uploadVerificationPhoto(photoFile, mission.id);
      
      // Update mission as completed
      const { error: updateError } = await supabase
        .from('personalized_missions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          verification_photo_url: photoUrl,
          verification_note: verificationNote
        })
        .eq('id', mission.id);

      if (updateError) throw updateError;

      // Check weekly completion manually
      const { start } = getCurrentWeekDates();
      const completedCount = missions.filter(m => m.is_completed).length;
      
      if (completedCount >= 7) {

      // Reload data
      await loadWeeklyMissions();
      await loadWeeklyStats();

      toast({
        title: '미션 완료! 🎉',
        description: `"${mission.mission_title}" 미션이 완료되었습니다.`,
      });

      
      if (completedCount >= 7) {
        // Award 7 tokens for weekly completion
        await supabase.rpc('admin_add_tokens', {
          target_user_id: user.id,
          token_amount: 7
        });
        
        toast({
          title: '주간 미션 완료! 🏆',
          description: '7일 미션을 모두 완료하여 7토큰을 받았습니다!',
        });
      }

      // Reset form
      setSelectedMission(null);
      setVerificationNote('');
      setPhotoFile(null);
      
    } catch (error) {
      console.error('Error completing mission:', error);
      toast({
        title: '미션 완료 실패',
        description: '미션을 완료할 수 없습니다. 다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setUploadingPhoto(null);
    }
  };

  const getDayName = (dayNum: number) => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    return days[dayNum - 1] || `${dayNum}일`;
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const progressPercentage = weeklyStats ? (weeklyStats.completed_missions / weeklyStats.total_missions) * 100 : 0;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-muted-foreground mt-2">미션을 불러오는 중...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">이번 주 미션</h2>
              <p className="text-sm text-muted-foreground">건강한 생활습관을 위한 주간 도전과제</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => generateWeeklyMissions(true)}
            disabled={generatingMissions}
          >
            {generatingMissions ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            새 미션 생성
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>진행률</span>
            <span className="font-semibold">
              {weeklyStats?.completed_missions || 0}/{weeklyStats?.total_missions || 7}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>완료: {Math.round(progressPercentage)}%</span>
            {weeklyStats?.is_week_completed && (
              <div className="flex items-center gap-1 text-green-600">
                <Gift className="w-3 h-3" />
                <span>7토큰 획득!</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Missions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission) => (
          <Card 
            key={mission.id} 
            className={`p-6 transition-all duration-300 hover:shadow-lg ${
              mission.is_completed 
                ? 'bg-green-50 border-green-200' 
                : 'hover:shadow-lg hover:border-primary/30'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm">
                  {getDayName(mission.day_of_week)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">{mission.mission_title}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs mt-1 ${getDifficultyColor(mission.difficulty_level)}`}
                  >
                    난이도 {mission.difficulty_level}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                {mission.is_completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{mission.mission_description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                {mission.target_behavior}
              </span>
              
              {!mission.is_completed ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedMission(mission)}
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      인증
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>미션 인증</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{selectedMission?.mission_title}</h4>
                        <p className="text-sm text-muted-foreground">{selectedMission?.mission_description}</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="photo">인증 사진 *</Label>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="note">완료 후기 (선택)</Label>
                        <Textarea
                          id="note"
                          value={verificationNote}
                          onChange={(e) => setVerificationNote(e.target.value)}
                          placeholder="미션을 완료한 소감을 적어주세요"
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => selectedMission && completeMission(selectedMission)}
                          disabled={!photoFile || uploadingPhoto === selectedMission?.id}
                          className="flex-1"
                        >
                          {uploadingPhoto === selectedMission?.id ? (
                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          완료하기
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedMission(null);
                            setVerificationNote('');
                            setPhotoFile(null);
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  완료
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Weekly Completion Reward */}
      {weeklyStats?.is_week_completed && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-yellow-800 mb-2">주간 미션 완료! 🎉</h3>
            <p className="text-yellow-700 mb-4">
              이번 주 모든 미션을 완료하여 <strong>7토큰</strong>을 획득했습니다!
            </p>
            <Badge className="bg-yellow-600 text-white">
              <Gift className="w-4 h-4 mr-1" />
              보상 지급 완료
            </Badge>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {missions.length === 0 && !generatingMissions && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">이번 주 미션이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            AI가 당신만을 위한 개인화된 주간 미션을 생성해드립니다
          </p>
          <Button onClick={() => generateWeeklyMissions()}>
            <Sparkles className="w-4 h-4 mr-2" />
            첫 미션 생성하기
          </Button>
        </Card>
      )}
    </div>
  );
};

export default WeeklyMissions;
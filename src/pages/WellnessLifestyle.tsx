import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  Brain, 
  Activity, 
  Apple, 
  Moon, 
  Sparkles,
  Dumbbell,
  BarChart3,
  Play,
  Flame,
  Trophy,
  Volume2,
  Image as ImageIcon,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WellnessLifestyle = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  
  // Meditation state
  const [meditationContent, setMeditationContent] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Workout state
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [workoutDuration, setWorkoutDuration] = useState('30');
  
  // Nutrition state
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  
  // Sleep state
  const [sleepAnalysis, setSleepAnalysis] = useState<any>(null);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  
  // Achievement state
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const handleMeditation = async () => {
    setLoading('meditation');
    try {
      toast({ 
        title: '🎵 AI 명상 생성 중...', 
        description: '맞춤 명상 스크립트와 음성을 생성하고 있습니다.' 
      });

      const { data, error } = await supabase.functions.invoke('wellness-ai-meditation');
      
      if (error) throw error;
      
      setMeditationContent(data);
      if (!completedTasks.includes('meditation')) {
        setCompletedTasks([...completedTasks, 'meditation']);
      }
      
      toast({
        title: '✨ AI 명상 준비 완료!',
        description: '오늘의 맞춤 명상을 시작하세요.',
      });
    } catch (error) {
      console.error('Meditation error:', error);
      toast({
        title: '오류 발생',
        description: '명상 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleWorkout = async () => {
    setLoading('workout');
    try {
      toast({ 
        title: '💪 운동 플랜 생성 중...', 
        description: '개인 맞춤형 운동 계획을 만들고 있습니다.' 
      });

      const { data, error } = await supabase.functions.invoke('wellness-ai-workout', {
        body: { 
          userLevel: 'intermediate',
          goals: '체력 증진',
          duration: parseInt(workoutDuration)
        }
      });
      
      if (error) throw error;
      
      setWorkoutPlan(data);
      if (!completedTasks.includes('workout')) {
        setCompletedTasks([...completedTasks, 'workout']);
      }
      
      toast({
        title: '✨ 운동 플랜 완성!',
        description: '오늘의 맞춤 운동을 확인하세요.',
      });
    } catch (error) {
      console.error('Workout error:', error);
      toast({
        title: '오류 발생',
        description: '운동 플랜 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleNutrition = async () => {
    setLoading('nutrition');
    try {
      toast({ 
        title: '🥗 영양 분석 중...', 
        description: '맞춤 식단과 영양제를 추천하고 있습니다.' 
      });

      const { data, error } = await supabase.functions.invoke('wellness-ai-nutrition', {
        body: {
          dietaryRestrictions: '없음',
          healthGoals: '건강한 체중 유지',
          allergies: '없음'
        }
      });
      
      if (error) throw error;
      
      setNutritionPlan(data);
      if (!completedTasks.includes('nutrition')) {
        setCompletedTasks([...completedTasks, 'nutrition']);
      }
      
      toast({
        title: '✨ 영양 분석 완료!',
        description: '맞춤 식단과 영양제를 확인하세요.',
      });
    } catch (error) {
      console.error('Nutrition error:', error);
      toast({
        title: '오류 발생',
        description: '영양 분석 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSleepAnalysis = async () => {
    setLoading('sleep');
    try {
      toast({ 
        title: '🌙 수면 분석 중...', 
        description: '맞춤 수면 계획을 생성하고 있습니다.' 
      });

      const { data, error } = await supabase.functions.invoke('wellness-ai-sleep', {
        body: {
          bedtime,
          wakeupTime,
          sleepIssues: '없음'
        }
      });
      
      if (error) throw error;
      
      setSleepAnalysis(data);
      if (!completedTasks.includes('sleep')) {
        setCompletedTasks([...completedTasks, 'sleep']);
      }
      
      toast({
        title: '✨ 수면 분석 완료!',
        description: '맞춤 수면 개선 계획을 확인하세요.',
      });
    } catch (error) {
      console.error('Sleep analysis error:', error);
      toast({
        title: '오류 발생',
        description: '수면 분석 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const toggleAudio = (base64Audio: string) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        toast({
          title: '오디오 재생 오류',
          description: '오디오를 재생할 수 없습니다.',
          variant: 'destructive',
        });
        setIsPlaying(false);
      };
      
      audio.play()
        .then(() => {
          setIsPlaying(true);
          toast({
            title: '🎵 나레이션 재생 중',
            description: '편안하게 들어보세요.',
          });
        })
        .catch((error) => {
          console.error('Audio play error:', error);
          toast({
            title: '재생 오류',
            description: '오디오 재생에 실패했습니다.',
            variant: 'destructive',
          });
          setIsPlaying(false);
        });
    }
  };

  const achievementPercentage = (completedTasks.length / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>AI 웰니스 대시보드 - 개인 맞춤형 건강 관리</title>
        <meta name="description" content="AI 기반 명상, 운동, 영양, 수면 분석으로 당신의 건강을 관리하세요" />
      </Helmet>
      
      <UnifiedNavigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">AI 웰니스 대시보드</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              당신만의 AI 건강 코치
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              OpenAI, ElevenLabs, 이미지 생성을 활용한 최첨단 웰니스 솔루션
            </p>

            {/* Achievement Progress */}
            <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    전체 성취도
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{achievementPercentage.toFixed(0)}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={achievementPercentage} className="h-4 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'meditation', icon: Brain, label: '명상' },
                    { id: 'workout', icon: Dumbbell, label: '운동' },
                    { id: 'nutrition', icon: Apple, label: '영양' },
                    { id: 'sleep', icon: Moon, label: '수면' }
                  ].map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      {completedTasks.includes(item.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={completedTasks.includes(item.id) ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          
          {/* Meditation Section */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                  <Brain className="h-8 w-8" />
                  AI 맞춤 명상
                </CardTitle>
                <Badge className="bg-blue-500 text-white">ElevenLabs 음성</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg"
                onClick={handleMeditation}
                disabled={loading === 'meditation'}
              >
                {loading === 'meditation' ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> 생성 중...</>
                ) : (
                  <><Play className="h-5 w-5 mr-2" /> 오늘의 맞춤 명상 시작</>
                )}
              </Button>

              {meditationContent && (
                <div className="space-y-6 bg-white/50 rounded-xl p-6">
                  {meditationContent.meditationImage && (
                    <div className="rounded-xl overflow-hidden">
                      <img 
                        src={meditationContent.meditationImage} 
                        alt="명상 이미지" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  
                  {meditationContent.audioContent && (
                    <div className="space-y-4 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                            <Volume2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-900">AI 음성 나레이션</h3>
                            <p className="text-sm text-blue-700">
                              {isPlaying ? '재생 중...' : 'ElevenLabs로 생성된 맞춤 명상 가이드'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => toggleAudio(meditationContent.audioContent)}
                          className={`px-8 py-6 text-lg font-semibold ${
                            isPlaying 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          } text-white shadow-lg transition-all`}
                        >
                          {isPlaying ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white"></div>
                              정지
                            </>
                          ) : (
                            <>
                              <Play className="h-5 w-5 mr-2" />
                              듣기
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {isPlaying && (
                        <div className="flex items-center gap-2 text-blue-700 animate-pulse">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-blue-500 rounded-full animate-pulse"
                                style={{
                                  height: `${Math.random() * 20 + 10}px`,
                                  animationDelay: `${i * 0.1}s`
                                }}
                              ></div>
                            ))}
                          </div>
                          <span className="text-sm font-medium">재생 중...</span>
                        </div>
                      )}
                      
                      <div className="text-sm text-blue-600 bg-white/50 p-3 rounded-lg">
                        💡 <strong>팁:</strong> 편안한 자세로 앉거나 누워서 들어보세요. 이어폰 사용을 권장합니다.
                      </div>
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">{meditationContent.content}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Section */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-green-900 flex items-center gap-3">
                  <Dumbbell className="h-8 w-8" />
                  맞춤 운동 플랜
                </CardTitle>
                <Badge className="bg-green-500 text-white">AI 생성</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label>운동 시간 (분)</Label>
                  <Input
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    min="10"
                    max="120"
                    className="mt-2"
                  />
                </div>
                <Button 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 md:mt-7"
                  onClick={handleWorkout}
                  disabled={loading === 'workout'}
                >
                  {loading === 'workout' ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> 생성 중...</>
                  ) : (
                    <><Flame className="h-5 w-5 mr-2" /> 운동 플랜 생성</>
                  )}
                </Button>
              </div>

              {workoutPlan && (
                <div className="space-y-6 bg-white/50 rounded-xl p-6">
                  {workoutPlan.motivationImage && (
                    <div className="rounded-xl overflow-hidden">
                      <img 
                        src={workoutPlan.motivationImage} 
                        alt="운동 동기부여 이미지" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">{workoutPlan.workoutPlan}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Section */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-orange-900 flex items-center gap-3">
                  <Apple className="h-8 w-8" />
                  영양 분석 & 추천
                </CardTitle>
                <Badge className="bg-orange-500 text-white">이미지 생성</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg"
                onClick={handleNutrition}
                disabled={loading === 'nutrition'}
              >
                {loading === 'nutrition' ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> 분석 중...</>
                ) : (
                  <><Apple className="h-5 w-5 mr-2" /> 맞춤 식단 & 영양제 추천</>
                )}
              </Button>

              {nutritionPlan && (
                <div className="space-y-6 bg-white/50 rounded-xl p-6">
                  {nutritionPlan.mealImage && (
                    <div className="rounded-xl overflow-hidden">
                      <img 
                        src={nutritionPlan.mealImage} 
                        alt="식사 이미지" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">{nutritionPlan.nutritionPlan}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sleep Section */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-purple-900 flex items-center gap-3">
                  <Moon className="h-8 w-8" />
                  스마트 수면 분석
                </CardTitle>
                <Badge className="bg-purple-500 text-white">AI 분석</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>취침 시간</Label>
                  <Input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>기상 시간</Label>
                  <Input
                    type="time"
                    value={wakeupTime}
                    onChange={(e) => setWakeupTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-6 text-lg"
                onClick={handleSleepAnalysis}
                disabled={loading === 'sleep'}
              >
                {loading === 'sleep' ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> 분석 중...</>
                ) : (
                  <><Moon className="h-5 w-5 mr-2" /> 수면 분석 시작</>
                )}
              </Button>

              {sleepAnalysis && (
                <div className="space-y-6 bg-white/50 rounded-xl p-6">
                  {sleepAnalysis.sleepEnvironmentImage && (
                    <div className="rounded-xl overflow-hidden">
                      <img 
                        src={sleepAnalysis.sleepEnvironmentImage} 
                        alt="수면 환경 이미지" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <p className="text-purple-900 font-semibold">
                      예상 수면 시간: {sleepAnalysis.sleepDuration}
                    </p>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">{sleepAnalysis.sleepAnalysis}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
};

export default WellnessLifestyle;

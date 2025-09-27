import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Star, 
  Lightbulb,
  BarChart3,
  Zap,
  Heart,
  Coffee,
  Moon,
  Dumbbell,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DailyPattern {
  category: string;
  activity: string;
  frequency: number;
  timeOfDay: string;
  satisfaction: number;
}

interface PersonalizedRoutine {
  id: string;
  title: string;
  description: string;
  category: string;
  timeSlot: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  benefits: string[];
  isCompleted?: boolean;
}

interface CoachingInsight {
  type: 'pattern' | 'recommendation' | 'warning' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

const PersonalizedAICoaching = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState<DailyPattern[]>([]);
  const [routines, setRoutines] = useState<PersonalizedRoutine[]>([]);
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 사용자 입력 상태
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [currentChallenges, setCurrentChallenges] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // 기존 사용자 데이터 로드 (실제로는 Supabase에서)
    // Mock data for demonstration
    const mockPatterns: DailyPattern[] = [
      { category: '수면', activity: '늦은 잠자리', frequency: 5, timeOfDay: '23:30', satisfaction: 3 },
      { category: '운동', activity: '산책', frequency: 3, timeOfDay: '19:00', satisfaction: 4 },
      { category: '식사', activity: '불규칙한 식사', frequency: 4, timeOfDay: '다양함', satisfaction: 2 },
      { category: '업무', activity: '장시간 집중', frequency: 5, timeOfDay: '09:00-18:00', satisfaction: 3 }
    ];
    setPatterns(mockPatterns);
  };

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    
    try {
      // 사용자 입력 데이터 수집
      const userData = {
        sleepTime,
        wakeTime,
        stressLevel,
        energyLevel,
        currentChallenges,
        patterns
      };

      // AI 분석 요청 (실제로는 Edge Function 호출)
      const { data, error } = await supabase.functions.invoke('personalized-ai-coach', {
        body: {
          userData,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      // Mock results for demonstration
      const mockRoutines: PersonalizedRoutine[] = [
        {
          id: '1',
          title: '모닝 에너지 부스트',
          description: '기상 후 15분 스트레칭과 명상으로 하루를 시작하세요',
          category: '아침루틴',
          timeSlot: '07:00-07:15',
          difficulty: 'easy',
          estimatedTime: 15,
          benefits: ['에너지 증진', '스트레스 감소', '집중력 향상']
        },
        {
          id: '2',
          title: '규칙적인 수면 패턴',
          description: '매일 같은 시간에 잠자리에 들어 수면의 질을 개선하세요',
          category: '수면',
          timeSlot: '22:30',
          difficulty: 'medium',
          estimatedTime: 30,
          benefits: ['수면 질 개선', '회복력 증진', '면역력 강화']
        },
        {
          id: '3',
          title: '점심시간 마인드풀니스',
          description: '식사 후 5분간 깊은 호흡과 감사 명상을 실천하세요',
          category: '점심루틴',
          timeSlot: '12:30-12:35',
          difficulty: 'easy',
          estimatedTime: 5,
          benefits: ['스트레스 완화', '소화 개선', '오후 에너지 충전']
        },
        {
          id: '4',
          title: '저녁 디지털 디톡스',
          description: '저녁 8시 이후 스크린 시간을 줄이고 독서나 가벼운 운동을 하세요',
          category: '저녁루틴',
          timeSlot: '20:00-21:00',
          difficulty: 'hard',
          estimatedTime: 60,
          benefits: ['수면 질 개선', '눈 건강', '정신적 안정']
        }
      ];

      const mockInsights: CoachingInsight[] = [
        {
          type: 'pattern',
          title: '수면 패턴 개선 필요',
          description: '평균 잠자리 시간이 23:30으로 너무 늦습니다. 22:30으로 앞당기는 것을 추천합니다.',
          actionable: true,
          priority: 'high'
        },
        {
          type: 'achievement',
          title: '운동 루틴 잘 유지 중',
          description: '주 3회 산책을 꾸준히 실천하고 있습니다. 훌륭해요!',
          actionable: false,
          priority: 'low'
        },
        {
          type: 'recommendation',
          title: '식사 시간 규칙화',
          description: '불규칙한 식사가 에너지 레벨에 영향을 주고 있습니다. 정해진 시간에 식사해보세요.',
          actionable: true,
          priority: 'medium'
        },
        {
          type: 'warning',
          title: '스트레스 레벨 주의',
          description: '현재 스트레스 레벨이 높습니다. 휴식과 명상 시간을 늘려보세요.',
          actionable: true,
          priority: 'high'
        }
      ];

      setRoutines(mockRoutines);
      setInsights(mockInsights);

      toast({
        title: "🤖 AI 분석 완료",
        description: "개인 맞춤형 루틴이 생성되었습니다!"
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 오류",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const markRoutineComplete = (routineId: string) => {
    setRoutines(prev => prev.map(routine => 
      routine.id === routineId 
        ? { ...routine, isCompleted: !routine.isCompleted }
        : routine
    ));
    
    toast({
      title: "✅ 완료!",
      description: "루틴이 완료되었습니다. 잘하고 있어요!"
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      '아침루틴': Coffee,
      '수면': Moon,
      '점심루틴': Coffee,
      '저녁루틴': BookOpen,
      '운동': Dumbbell,
      '명상': Heart
    };
    return icons[category as keyof typeof icons] || Target;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      hard: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty as keyof typeof colors];
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      pattern: BarChart3,
      recommendation: Lightbulb,
      warning: Clock,
      achievement: Star
    };
    return icons[type as keyof typeof icons] || Lightbulb;
  };

  const getInsightColor = (priority: string) => {
    const colors = {
      low: 'border-l-blue-500 bg-blue-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      high: 'border-l-red-500 bg-red-50'
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-blue-100">
            <Brain className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">개인 맞춤 AI 코칭</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Zap className="w-3 h-3 mr-1" />
            NEW
          </Badge>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AI가 당신의 일상 패턴을 분석하여 개인 맞춤형 루틴과 건강한 습관을 제안합니다
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">데이터 입력</TabsTrigger>
          <TabsTrigger value="analysis">패턴 분석</TabsTrigger>
          <TabsTrigger value="routines">맞춤 루틴</TabsTrigger>
          <TabsTrigger value="insights">AI 인사이트</TabsTrigger>
        </TabsList>

        {/* 데이터 입력 */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                개인 정보 입력
              </CardTitle>
              <CardDescription>
                더 정확한 분석을 위해 현재 생활 패턴을 알려주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">평소 취침 시간</label>
                  <Input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    placeholder="예: 23:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">평소 기상 시간</label>
                  <Input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    placeholder="예: 07:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">현재 스트레스 레벨</label>
                  <div className="space-y-3">
                    <Progress value={stressLevel * 10} className="h-3" />
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>낮음 (1)</span>
                      <span className="font-medium">{stressLevel}/10</span>
                      <span>높음 (10)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">현재 에너지 레벨</label>
                  <div className="space-y-3">
                    <Progress value={energyLevel * 10} className="h-3" />
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>낮음 (1)</span>
                      <span className="font-medium">{energyLevel}/10</span>
                      <span>높음 (10)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">현재 고민이나 개선하고 싶은 점</label>
                <Textarea
                  value={currentChallenges}
                  onChange={(e) => setCurrentChallenges(e.target.value)}
                  placeholder="예: 업무 스트레스가 많고, 불규칙한 수면으로 피로가 쌓여요..."
                  rows={4}
                />
              </div>

              <Button
                onClick={analyzePatterns}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    AI 분석 시작
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 패턴 분석 */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                현재 생활 패턴 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patterns.map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{pattern.activity}</h3>
                      <Badge variant="outline">{pattern.category}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>빈도:</span>
                        <span>주 {pattern.frequency}회</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>시간:</span>
                        <span>{pattern.timeOfDay}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>만족도:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < pattern.satisfaction 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 맞춤 루틴 */}
        <TabsContent value="routines" className="space-y-6">
          {routines.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routines.map((routine, index) => {
                const IconComponent = getCategoryIcon(routine.category);
                return (
                  <motion.div
                    key={routine.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${routine.isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">{routine.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getDifficultyColor(routine.difficulty)}>
                                  {routine.difficulty}
                                </Badge>
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {routine.estimatedTime}분
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={routine.isCompleted ? "default" : "outline"}
                            size="sm"
                            onClick={() => markRoutineComplete(routine.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{routine.description}</p>
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">추천 시간:</p>
                          <p className="text-blue-600 font-medium">{routine.timeSlot}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">기대 효과:</p>
                          <div className="flex flex-wrap gap-1">
                            {routine.benefits.map((benefit, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* AI 인사이트 */}
        <TabsContent value="insights" className="space-y-6">
          {insights.length > 0 && (
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border-l-4 rounded-lg ${getInsightColor(insight.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 mt-1 text-gray-600" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.priority === 'high' ? '높음' : 
                             insight.priority === 'medium' ? '보통' : '낮음'}
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline" className="text-xs">
                              실행 가능
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedAICoaching;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
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
  BookOpen,
  AlertTriangle,
  Award,
  Sparkles,
  Activity,
  Timer,
  Flame,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

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
  priority?: number;
  streakCount?: number;
}

interface CoachingInsight {
  type: 'pattern' | 'recommendation' | 'warning' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  confidence?: number;
  category?: string;
}

interface BiometricData {
  heartRate?: number;
  sleepQuality?: number;
  steps?: number;
  mood?: number;
}

const PersonalizedAICoaching = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState<DailyPattern[]>([]);
  const [routines, setRoutines] = useState<PersonalizedRoutine[]>([]);
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [progressData, setProgressData] = useState<any>({});
  const [biometrics, setBiometrics] = useState<BiometricData>({});

  // 사용자 입력 상태
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [stressLevel, setStressLevel] = useState([5]);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [moodLevel, setMoodLevel] = useState([5]);
  const [currentChallenges, setCurrentChallenges] = useState('');
  const [lifeGoals, setLifeGoals] = useState('');
  const [exerciseFrequency, setExerciseFrequency] = useState([3]);
  const [workHours, setWorkHours] = useState([8]);

  useEffect(() => {
    loadUserData();
    loadProgressData();
  }, []);

  const loadUserData = async () => {
    // 기존 사용자 데이터와 개선된 패턴 로드
    const enhancedPatterns: DailyPattern[] = [
      { category: '수면', activity: '불규칙한 수면', frequency: 5, timeOfDay: '23:30', satisfaction: 3 },
      { category: '운동', activity: '헬스장 운동', frequency: 3, timeOfDay: '19:00', satisfaction: 4 },
      { category: '식사', activity: '불규칙한 식사', frequency: 4, timeOfDay: '다양함', satisfaction: 2 },
      { category: '업무', activity: '장시간 집중', frequency: 5, timeOfDay: '09:00-18:00', satisfaction: 3 },
      { category: '휴식', activity: '스마트폰 사용', frequency: 7, timeOfDay: '저녁', satisfaction: 2 },
      { category: '사회활동', activity: '친구들과 만남', frequency: 2, timeOfDay: '주말', satisfaction: 5 }
    ];
    setPatterns(enhancedPatterns);
  };

  const loadProgressData = () => {
    // 사용자 진행 상황 데이터 로드
    const mockProgress = {
      weeklyCompletion: 75,
      streakDays: 12,
      totalRoutines: 45,
      completedGoals: 8
    };
    setProgressData(mockProgress);
  };

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    
    try {
      // 입력 데이터 유효성 검사
      if (!sleepTime || !wakeTime) {
        toast({
          title: "입력 데이터 부족",
          description: "수면 시간과 기상 시간을 입력해주세요",
          variant: "destructive"
        });
        return;
      }

      // 고도화된 사용자 데이터 수집
      const userData = {
        sleepTime,
        wakeTime,
        stressLevel: stressLevel[0],
        energyLevel: energyLevel[0],
        moodLevel: moodLevel[0],
        currentChallenges,
        lifeGoals,
        exerciseFrequency: exerciseFrequency[0],
        workHours: workHours[0],
        patterns,
        biometrics,
        preferences: {
          difficultyLevel: 'adaptive',
          focusAreas: ['stress_management', 'energy_boost', 'productivity'],
          timeConstraints: 'flexible'
        }
      };

      console.log('Sending enhanced analysis request:', userData);

      // AI 분석 요청 - 실제 Edge Function 호출
      const { data, error } = await supabase.functions.invoke('personalized-ai-coach', {
        body: {
          userData,
          analysisType: 'comprehensive_advanced'
        }
      });

      console.log('AI Analysis response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data && data.success && data.routines && data.insights) {
        // 실제 AI 응답 처리
        setRoutines(data.routines.map((routine: any) => ({
          ...routine,
          isCompleted: false,
          streakCount: 0
        })));
        setInsights(data.insights);

        toast({
          title: "🤖 AI 분석 완료",
          description: `${data.routines.length}개의 맞춤 루틴과 ${data.insights.length}개의 인사이트가 생성되었습니다!`
        });
      } else {
        throw new Error('Invalid AI response format');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      
      // 에러 발생 시 고도화된 폴백 데이터 제공
      const fallbackRoutines = generateAdvancedFallbackRoutines();
      const fallbackInsights = generateAdvancedFallbackInsights();
      
      setRoutines(fallbackRoutines);
      setInsights(fallbackInsights);
      
      toast({
        title: "🤖 고급 분석 완료 (오프라인 모드)",
        description: "AI 서버 연결 문제로 고급 기본 분석을 제공합니다",
        variant: "default"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAdvancedFallbackRoutines = (): PersonalizedRoutine[] => {
    const baseRoutines: PersonalizedRoutine[] = [];
    
    // 개인화된 아침 루틴
    if (wakeTime) {
      const wakeHour = parseInt(wakeTime.split(':')[0]);
      baseRoutines.push({
        id: '1',
        title: '스마트 모닝 루틴',
        description: '개인 맞춤형 아침 활성화 프로그램: 명상 + 스트레칭 + 목표 설정',
        category: '아침루틴',
        timeSlot: `${String(wakeHour).padStart(2, '0')}:00-${String(wakeHour).padStart(2, '0')}:20`,
        difficulty: 'easy',
        estimatedTime: 20,
        benefits: ['뇌 활성화', '에너지 부스트', '하루 방향성 설정'],
        priority: 1
      });
    }

    // 스트레스 레벨에 따른 맞춤 루틴
    if (stressLevel[0] >= 7) {
      baseRoutines.push({
        id: '2',
        title: '즉시 스트레스 완화 프로토콜',
        description: '박스 호흡법(4-4-4-4) + 근육 이완 + 긍정 확언으로 스트레스 즉시 완화',
        category: '스트레스관리',
        timeSlot: '필요시 언제든',
        difficulty: 'easy',
        estimatedTime: 5,
        benefits: ['스트레스 감소', '심박수 안정', '정신 명료화'],
        priority: 1
      });
    }

    // 에너지 레벨에 따른 맞춤 루틴
    if (energyLevel[0] <= 4) {
      baseRoutines.push({
        id: '3',
        title: '에너지 리차지 부스터',
        description: '5분 고강도 운동 + 단백질 섭취 + 차가운 물로 세수하기',
        category: '에너지부스트',
        timeSlot: '오후 2-4시',
        difficulty: 'medium',
        estimatedTime: 10,
        benefits: ['즉시 에너지 증진', '혈액순환 개선', '각성 상태 향상'],
        priority: 1
      });
    }

    // 운동 빈도에 따른 루틴
    if (exerciseFrequency[0] < 3) {
      baseRoutines.push({
        id: '4',
        title: '마이크로 피트니스',
        description: '하루 3번, 5분씩 간단한 운동으로 체력과 건강 향상',
        category: '운동',
        timeSlot: '아침, 점심, 저녁',
        difficulty: 'easy',
        estimatedTime: 15,
        benefits: ['기초체력 향상', '신진대사 증진', '스트레스 해소'],
        priority: 2
      });
    }

    // 수면 최적화 루틴
    if (sleepTime) {
      const sleepHour = parseInt(sleepTime.split(':')[0]);
      baseRoutines.push({
        id: '5',
        title: '스마트 슬립 프렙',
        description: '수면 1시간 전 디지털 디톡스 + 따뜻한 차 + 독서/명상',
        category: '수면',
        timeSlot: `${String(sleepHour - 1).padStart(2, '0')}:00-${sleepTime}`,
        difficulty: 'easy',
        estimatedTime: 60,
        benefits: ['수면 질 향상', '깊은 잠', '다음날 컨디션 개선'],
        priority: 1
      });
    }

    // 생산성 향상 루틴
    baseRoutines.push({
      id: '6',
      title: '포커스 터보 모드',
      description: '포모도로 기법 + 명상 + 우선순위 설정으로 집중력 극대화',
      category: '생산성',
      timeSlot: '업무 시간',
      difficulty: 'medium',
      estimatedTime: 25,
      benefits: ['집중력 향상', '업무 효율성', '목표 달성률 증가'],
      priority: 2
    });

    // 정신건강 루틴
    if (moodLevel[0] <= 5) {
      baseRoutines.push({
        id: '7',
        title: '무드 부스터 세라피',
        description: '감사 일기 + 긍정 시각화 + 좋아하는 음악 듣기',
        category: '정신건강',
        timeSlot: '저녁 시간',
        difficulty: 'easy',
        estimatedTime: 15,
        benefits: ['기분 개선', '긍정성 증가', '정서적 안정'],
        priority: 1
      });
    }

    return baseRoutines;
  };

  const generateAdvancedFallbackInsights = (): CoachingInsight[] => {
    const insights: CoachingInsight[] = [];

    // 종합적인 생활 패턴 분석
    const avgSatisfaction = patterns.reduce((sum, p) => sum + p.satisfaction, 0) / patterns.length;
    
    if (avgSatisfaction < 3) {
      insights.push({
        type: 'warning',
        title: '전반적인 생활 만족도 저하',
        description: '현재 생활 패턴에서 만족도가 낮은 영역이 많습니다. 우선순위를 정해 단계적으로 개선하는 것이 중요합니다.',
        actionable: true,
        priority: 'high',
        confidence: 85,
        category: '종합분석'
      });
    }

    // 스트레스-에너지 상관관계 분석
    const stressEnergyRatio = stressLevel[0] / energyLevel[0];
    if (stressEnergyRatio > 1.5) {
      insights.push({
        type: 'warning',
        title: '스트레스-에너지 불균형 감지',
        description: '스트레스가 에너지 대비 과도하게 높습니다. 즉시 스트레스 관리 기법을 적용하고 에너지 회복에 집중하세요.',
        actionable: true,
        priority: 'high',
        confidence: 92,
        category: '정신건강'
      });
    }

    // 수면 패턴 고급 분석
    if (sleepTime && wakeTime) {
      const sleepHour = parseInt(sleepTime.split(':')[0]);
      const wakeHour = parseInt(wakeTime.split(':')[0]);
      const sleepDuration = wakeHour < sleepHour ? (24 - sleepHour) + wakeHour : wakeHour - sleepHour;
      
      if (sleepHour > 0 && sleepHour < 6) { // 새벽 2-6시 취침
        insights.push({
          type: 'warning',
          title: '수면 리듬 불규칙',
          description: '너무 늦은 취침 시간이 생체 리듬을 방해하고 있습니다. 점진적으로 취침 시간을 앞당겨보세요.',
          actionable: true,
          priority: 'high',
          confidence: 90,
          category: '수면건강'
        });
      }

      if (sleepDuration >= 7 && sleepDuration <= 8) {
        insights.push({
          type: 'achievement',
          title: '이상적인 수면 시간 유지',
          description: `${sleepDuration}시간의 적정 수면을 유지하고 있습니다. 수면의 질을 더욱 높이는 것에 집중해보세요.`,
          actionable: false,
          priority: 'low',
          confidence: 95,
          category: '수면건강'
        });
      }
    }

    // 운동 패턴 분석
    if (exerciseFrequency[0] >= 5) {
      insights.push({
        type: 'achievement',
        title: '우수한 운동 습관',
        description: '주 5회 이상의 규칙적인 운동은 건강한 라이프스타일의 핵심입니다. 지속 가능한 강도로 유지하세요.',
        actionable: false,
        priority: 'low',
        confidence: 88,
        category: '건강관리'
      });
    } else if (exerciseFrequency[0] < 2) {
      insights.push({
        type: 'recommendation',
        title: '운동량 증가 필요',
        description: '현재 운동량이 부족합니다. 주 3회 30분씩 시작하여 점진적으로 늘려가세요.',
        actionable: true,
        priority: 'medium',
        confidence: 85,
        category: '건강관리'
      });
    }

    // 업무-삶 균형 분석
    if (workHours[0] > 9) {
      insights.push({
        type: 'warning',
        title: '과로 위험 신호',
        description: `하루 ${workHours[0]}시간의 업무는 번아웃 위험을 높입니다. 업무 효율성을 높이고 휴식 시간을 확보하세요.`,
        actionable: true,
        priority: 'high',
        confidence: 90,
        category: '워라밸'
      });
    }

    // 개인 성장 포텐셜 분석
    if (currentChallenges && lifeGoals) {
      insights.push({
        type: 'recommendation',
        title: '개인 성장 로드맵 구축',
        description: '명확한 목표와 도전 의식을 가지고 있어 성장 가능성이 높습니다. 체계적인 실행 계획을 세워보세요.',
        actionable: true,
        priority: 'medium',
        confidence: 80,
        category: '개인성장'
      });
    }

    // AI 코칭 효과 예측
    insights.push({
      type: 'pattern',
      title: 'AI 코칭 효과 예측',
      description: '현재 데이터를 바탕으로 4주간 꾸준한 실행시 스트레스 30% 감소, 에너지 40% 증가가 예상됩니다.',
      actionable: false,
      priority: 'low',
      confidence: 75,
      category: '예측분석'
    });

    return insights;
  };

  const markRoutineComplete = (routineId: string) => {
    setRoutines(prev => prev.map(routine => 
      routine.id === routineId 
        ? { 
            ...routine, 
            isCompleted: !routine.isCompleted,
            streakCount: routine.isCompleted ? (routine.streakCount || 0) : (routine.streakCount || 0) + 1
          }
        : routine
    ));
    
    const routine = routines.find(r => r.id === routineId);
    toast({
      title: routine?.isCompleted ? "😴 루틴 미완료" : "✅ 완료!",
      description: routine?.isCompleted ? "다음에 더 열심히 해보세요!" : `${routine?.title} 루틴 완료! 잘하고 있어요!`
    });
  };

  // Helper functions for UI rendering
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      '아침루틴': Coffee,
      '저녁루틴': Moon,
      '운동': Dumbbell,
      '명상': Brain,
      '수면': Moon,
      '식사': Coffee,
      '업무': Target,
      '스트레스관리': Heart,
      '에너지부스트': Zap,
      '생산성': TrendingUp,
      '정신건강': Smile
    };
    return iconMap[category] || Activity;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'achievement': return Award;
      case 'recommendation': return Lightbulb;
      case 'pattern': return BarChart3;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getMoodIcon = (mood: number) => {
    if (mood <= 3) return Frown;
    if (mood <= 6) return Meh;
    return Smile;
  };

  const filteredRoutines = selectedCategory === 'all' 
    ? routines 
    : routines.filter(routine => routine.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(routines.map(r => r.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI 라이프 코치
            </h1>
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              PREMIUM
            </Badge>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            고급 AI 알고리즘이 당신의 생활 패턴을 분석하여 개인 맞춤형 루틴과 인사이트를 제공합니다
          </p>
          
          {/* Progress Overview */}
          {progressData.weeklyCompletion && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-2xl mx-auto">
              <div className="bg-white/80 p-4 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{progressData.weeklyCompletion}%</div>
                <div className="text-sm text-gray-600">주간 완료율</div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{progressData.streakDays}</div>
                <div className="text-sm text-gray-600">연속 일수</div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">{progressData.totalRoutines}</div>
                <div className="text-sm text-gray-600">총 루틴 수</div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{progressData.completedGoals}</div>
                <div className="text-sm text-gray-600">달성 목표</div>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="setup" className="data-[state=active]:bg-purple-100">데이터 입력</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-100">스마트 분석</TabsTrigger>
            <TabsTrigger value="routines" className="data-[state=active]:bg-green-100">맞춤 루틴</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-orange-100">AI 인사이트</TabsTrigger>
          </TabsList>

          {/* Enhanced Data Input */}
          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    기본 정보
                  </CardTitle>
                  <CardDescription>
                    일상 리듬 분석을 위한 기본 데이터를 입력하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">취침 시간</label>
                      <Input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">기상 시간</label>
                      <Input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      일일 업무 시간: {workHours[0]}시간
                    </label>
                    <Slider
                      value={workHours}
                      onValueChange={setWorkHours}
                      max={16}
                      min={4}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      주간 운동 빈도: 주 {exerciseFrequency[0]}회
                    </label>
                    <Slider
                      value={exerciseFrequency}
                      onValueChange={setExerciseFrequency}
                      max={7}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Wellbeing Metrics */}
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-blue-600" />
                    웰빙 지수
                  </CardTitle>
                  <CardDescription>
                    현재 상태를 정확히 측정해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">스트레스 레벨</label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{stressLevel[0] <= 3 ? '😌' : stressLevel[0] <= 6 ? '😐' : '😰'}</span>
                        <Badge variant="outline">{stressLevel[0]}/10</Badge>
                      </div>
                    </div>
                    <Slider
                      value={stressLevel}
                      onValueChange={setStressLevel}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">에너지 레벨</label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{energyLevel[0] <= 3 ? '🔋' : energyLevel[0] <= 6 ? '⚡' : '⚡⚡'}</span>
                        <Badge variant="outline">{energyLevel[0]}/10</Badge>
                      </div>
                    </div>
                    <Slider
                      value={energyLevel}
                      onValueChange={setEnergyLevel}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">기분 상태</label>
                      <div className="flex items-center gap-2">
                        {React.createElement(getMoodIcon(moodLevel[0]), { 
                          className: "w-6 h-6 text-yellow-500" 
                        })}
                        <Badge variant="outline">{moodLevel[0]}/10</Badge>
                      </div>
                    </div>
                    <Slider
                      value={moodLevel}
                      onValueChange={setMoodLevel}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Goals and Challenges */}
              <Card className="bg-white/80 backdrop-blur-sm border-green-100 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    목표 및 도전 과제
                  </CardTitle>
                  <CardDescription>
                    구체적인 목표와 현재 직면한 도전들을 공유해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">현재 고민사항</label>
                    <Textarea
                      placeholder="예: 업무 스트레스가 심해서 잠을 잘 못 자고, 운동할 시간이 부족해요..."
                      value={currentChallenges}
                      onChange={(e) => setCurrentChallenges(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">인생 목표</label>
                    <Textarea
                      placeholder="예: 건강한 라이프스타일 유지, 업무-삶 균형 찾기, 새로운 취미 개발..."
                      value={lifeGoals}
                      onChange={(e) => setLifeGoals(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={analyzePatterns} 
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    고급 AI 분석 시작
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Enhanced Pattern Analysis */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  생활 패턴 분석
                </CardTitle>
                <CardDescription>
                  현재 생활 패턴의 상세 분석 결과입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patterns.map((pattern, index) => {
                    const IconComponent = getCategoryIcon(pattern.category);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-gray-200 bg-white/50"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold">{pattern.category}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{pattern.activity}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">주 {pattern.frequency}회</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{pattern.satisfaction}/5</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress 
                            value={pattern.satisfaction * 20} 
                            className="h-2"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Personalized Routines */}
          <TabsContent value="routines" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? '전체' : category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredRoutines.map((routine, index) => {
                  const IconComponent = getCategoryIcon(routine.category);
                  return (
                    <motion.div
                      key={routine.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`relative overflow-hidden transition-all duration-300 ${
                        routine.isCompleted 
                          ? 'bg-green-50 border-green-200 shadow-lg' 
                          : 'bg-white/80 border-gray-200 hover:shadow-lg'
                      }`}>
                        {routine.priority === 1 && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-500 text-white">
                              <Flame className="w-3 h-3 mr-1" />
                              우선순위
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <IconComponent className="w-6 h-6 text-blue-600" />
                              <div>
                                <CardTitle className="text-lg">{routine.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={getDifficultyColor(routine.difficulty)}
                                  >
                                    {routine.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Timer className="w-3 h-3 mr-1" />
                                    {routine.estimatedTime}분
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <p className="text-gray-600">{routine.description}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{routine.timeSlot}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {routine.benefits.map((benefit, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>

                          {routine.streakCount && routine.streakCount > 0 && (
                            <div className="flex items-center gap-2 text-orange-600">
                              <Flame className="w-4 h-4" />
                              <span className="text-sm font-medium">{routine.streakCount}일 연속</span>
                            </div>
                          )}

                          <Button
                            onClick={() => markRoutineComplete(routine.id)}
                            className={`w-full ${
                              routine.isCompleted
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {routine.isCompleted ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                완료됨
                              </>
                            ) : (
                              <>
                                <Target className="w-4 h-4 mr-2" />
                                시작하기
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Enhanced AI Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {insights.map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${getInsightColor(insight.priority)} transition-all duration-300 hover:shadow-lg`}>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${
                            insight.priority === 'high' ? 'bg-red-100' :
                            insight.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            <IconComponent className={`w-6 h-6 ${
                              insight.priority === 'high' ? 'text-red-600' :
                              insight.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <Badge 
                                variant="outline" 
                                className={
                                  insight.priority === 'high' ? 'border-red-300 text-red-700' :
                                  insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' : 
                                  'border-green-300 text-green-700'
                                }
                              >
                                {insight.priority === 'high' ? '높음' : 
                                 insight.priority === 'medium' ? '보통' : '낮음'}
                              </Badge>
                              {insight.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {insight.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700">{insight.description}</p>
                            
                            {insight.confidence && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600">AI 신뢰도</span>
                                  <span className="font-medium">{insight.confidence}%</span>
                                </div>
                                <Progress value={insight.confidence} className="h-2" />
                              </div>
                            )}

                            {insight.actionable && (
                              <div className="mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  액션 플랜 보기
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PersonalizedAICoaching;
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Brain, 
  Activity, 
  Apple, 
  Moon, 
  Zap, 
  Timer, 
  Calendar,
  Target,
  TrendingUp,
  Sparkles,
  Pill,
  Leaf,
  Dumbbell,
  Shield,
  Users,
  BarChart3,
  FileText,
  ArrowRight,
  Play,
  Star,
  Flame,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isBetaTestPeriod } from '@/utils/betaTest';

const WellnessLifestyle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyScore, setDailyScore] = useState(87);
  const [weeklyProgress, setWeeklyProgress] = useState(65);
  const [activeUsers, setActiveUsers] = useState(1247);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // 실시간 지표 업데이트 시뮬레이션
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAIAnalysis = async (type: string) => {
    try {
      toast({ 
        title: `🎉 ${isBetaTestPeriod() ? '베타테스트 무료 이용' : 'AI 분석 시작'}`, 
        description: '고급 AI 분석이 시작되었습니다!' 
      });
      
      // 페이지별 네비게이션
      const routes = {
        'mindfulness': '/meditation',
        'fitness': '/workout-plan',
        'nutrition': '/nutrition-guide',
        'sleep': '/sleep-analysis'
      };
      
      if (routes[type as keyof typeof routes]) {
        navigate(routes[type as keyof typeof routes]);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>라이프 허브 - 차세대 AI 웰니스 플랫폼</title>
        <meta name="description" content="실리콘밸리 기술로 구현한 개인 맞춤형 웰니스 솔루션. AI 기반 건강 분석, 실시간 바이오 피드백, 스마트 라이프스타일 코칭" />
      </Helmet>
      
      <UnifiedNavigation />
      
      {/* Hero Section with Real-time Dashboard */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8 animate-bounce">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">차세대 웰니스 허브</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent animate-fade-in">
              당신의 라이프를<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">재설계</span>하세요
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              AI 기반 실시간 생체 분석으로 개인 맞춤형 웰니스 솔루션을 제공합니다
            </p>

            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all hover-scale">
                <div className="text-3xl font-bold text-blue-600 mb-2">{activeUsers.toLocaleString()}+</div>
                <div className="text-gray-600">실시간 활성 사용자</div>
                <div className="flex items-center justify-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-green-600">Live</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all hover-scale">
                <div className="text-3xl font-bold text-purple-600 mb-2">{dailyScore}%</div>
                <div className="text-gray-600">오늘의 웰니스 스코어</div>
                <Progress value={dailyScore} className="mt-3" />
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all hover-scale">
                <div className="text-3xl font-bold text-green-600 mb-2">{weeklyProgress}%</div>
                <div className="text-gray-600">주간 목표 달성률</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12% 상승</span>
                </div>
              </div>
            </div>

            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover-scale"
              onClick={() => navigate('/assessment')}
            >
              <Play className="h-6 w-6 mr-3" />
              무료 웰니스 분석 시작
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Dashboard */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-16 bg-white/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <TabsTrigger value="overview" className="text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <BarChart3 className="h-5 w-5 mr-2" />
                대시보드
              </TabsTrigger>
              <TabsTrigger value="ai-coach" className="text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Brain className="h-5 w-5 mr-2" />
                AI 코치
              </TabsTrigger>
              <TabsTrigger value="biometrics" className="text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Activity className="h-5 w-5 mr-2" />
                바이오메트릭
              </TabsTrigger>
              <TabsTrigger value="community" className="text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                <Users className="h-5 w-5 mr-2" />
                커뮤니티
              </TabsTrigger>
            </TabsList>

            {/* Overview Dashboard */}
            <TabsContent value="overview" className="mt-12 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Mindfulness Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-blue-500 text-white">AI 분석</Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-900">마음챙김 & 명상</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">스트레스 레벨</span>
                        <span className="font-bold text-blue-900">낮음</span>
                      </div>
                      <Progress value={25} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">집중력 지수</span>
                        <span className="font-bold text-blue-900">85%</span>
                      </div>
                      <Progress value={85} className="h-3" />
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-sm text-blue-700 mb-2">오늘의 추천</div>
                      <div className="text-blue-900 font-semibold">🧘‍♀️ 10분 호흡 명상</div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl"
                      onClick={() => handleAIAnalysis('mindfulness')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI 맞춤 명상 시작
                    </Button>
                  </CardContent>
                </Card>

                {/* Fitness Card */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                        <Dumbbell className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-green-500 text-white">실시간</Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-900">스마트 피트니스</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700">오늘 활동량</span>
                        <span className="font-bold text-green-900">7,890 걸음</span>
                      </div>
                      <Progress value={79} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-green-700">칼로리 소모</span>
                        <span className="font-bold text-green-900">340 kcal</span>
                      </div>
                      <Progress value={68} className="h-3" />
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-sm text-green-700 mb-2">AI 추천 운동</div>
                      <div className="text-green-900 font-semibold">💪 15분 HIIT 트레이닝</div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl"
                      onClick={() => handleAIAnalysis('fitness')}
                    >
                      <Flame className="h-4 w-4 mr-2" />
                      맞춤 운동 시작
                    </Button>
                  </CardContent>
                </Card>

                {/* Nutrition Card */}
                <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                        <Apple className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-orange-500 text-white">영양 AI</Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-orange-900">스마트 영양관리</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-orange-700">일일 칼로리</span>
                        <span className="font-bold text-orange-900">1,650 / 2,000</span>
                      </div>
                      <Progress value={83} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-orange-700">영양 균형</span>
                        <span className="font-bold text-orange-900">92%</span>
                      </div>
                      <Progress value={92} className="h-3" />
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-sm text-orange-700 mb-2">다음 식사 추천</div>
                      <div className="text-orange-900 font-semibold">🥗 그릭 요거트 & 견과류</div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl"
                      onClick={() => handleAIAnalysis('nutrition')}
                    >
                      <Apple className="h-4 w-4 mr-2" />
                      영양 분석 시작
                    </Button>
                  </CardContent>
                </Card>

                {/* Sleep Card */}
                <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale group lg:col-span-2 xl:col-span-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Moon className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-purple-500 text-white">수면 AI</Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-purple-900">스마트 수면분석</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">수면 품질</span>
                        <span className="font-bold text-purple-900">우수</span>
                      </div>
                      <Progress value={88} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700">총 수면시간</span>
                        <span className="font-bold text-purple-900">7시간 30분</span>
                      </div>
                      <Progress value={94} className="h-3" />
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-sm text-purple-700 mb-2">수면 개선 팁</div>
                      <div className="text-purple-900 font-semibold">🌙 저녁 9시 이후 블루라이트 차단</div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl"
                      onClick={() => handleAIAnalysis('sleep')}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      수면 분석 받기
                    </Button>
                  </CardContent>
                </Card>

                {/* Achievement Card */}
                <Card className="bg-gradient-to-br from-pink-50 to-rose-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale group lg:col-span-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        <Star className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-pink-500 text-white">성취</Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-pink-900">주간 성취도</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white/50 rounded-xl">
                        <div className="text-2xl font-bold text-pink-900">🏃‍♀️</div>
                        <div className="text-sm text-pink-700 mt-2">운동 7일 연속</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 rounded-xl">
                        <div className="text-2xl font-bold text-pink-900">🧘‍♀️</div>
                        <div className="text-sm text-pink-700 mt-2">명상 5일 연속</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 rounded-xl">
                        <div className="text-2xl font-bold text-pink-900">💤</div>
                        <div className="text-sm text-pink-700 mt-2">수면 목표 달성</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 rounded-xl">
                        <div className="text-2xl font-bold text-pink-900">🥗</div>
                        <div className="text-sm text-pink-700 mt-2">영양 밸런스</div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 rounded-xl"
                      onClick={() => navigate('/achievements')}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      전체 성취도 보기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Coach Tab */}
            <TabsContent value="ai-coach" className="mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-100 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
                      <Brain className="h-8 w-8" />
                      AI 개인 코치
                    </CardTitle>
                    <p className="text-indigo-700">24/7 맞춤형 건강 가이드</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-white/50 rounded-xl p-6">
                      <h4 className="font-semibold text-indigo-900 mb-4">오늘의 AI 추천</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>아침 10분 명상으로 집중력 향상</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>점심 후 15분 산책 추천</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>저녁 9시 이후 디지털 디톡스</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-4 text-lg"
                      onClick={() => navigate('/ai-counselor')}
                    >
                      AI 코치와 대화하기
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-purple-900 flex items-center gap-3">
                      <Target className="h-8 w-8" />
                      맞춤 목표 설정
                    </CardTitle>
                    <p className="text-purple-700">AI가 분석한 개인 맞춤 목표</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-white/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-purple-900">주간 운동 목표</span>
                          <span className="text-purple-600">5/7일</span>
                        </div>
                        <Progress value={71} className="h-3" />
                      </div>
                      
                      <div className="bg-white/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-purple-900">수면 품질 개선</span>
                          <span className="text-purple-600">88%</span>
                        </div>
                        <Progress value={88} className="h-3" />
                      </div>
                      
                      <div className="bg-white/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-purple-900">스트레스 관리</span>
                          <span className="text-purple-600">92%</span>
                        </div>
                        <Progress value={92} className="h-3" />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-4 text-lg"
                      onClick={() => navigate('/goal-setting')}
                    >
                      목표 재설정하기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Biometrics Tab */}
            <TabsContent value="biometrics" className="mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="bg-gradient-to-br from-red-50 to-pink-100 border-0 shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-red-900 flex items-center justify-center gap-2">
                      <Heart className="h-6 w-6" />
                      심박수
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-6xl font-bold text-red-600">72</div>
                    <div className="text-red-700">BPM</div>
                    <Badge className="bg-green-500 text-white">정상</Badge>
                    <div className="text-sm text-red-600">실시간 모니터링 중</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-0 shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
                      <Activity className="h-6 w-6" />
                      활동량
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-6xl font-bold text-blue-600">8.2</div>
                    <div className="text-blue-700">천 걸음</div>
                    <Badge className="bg-orange-500 text-white">목표 82%</Badge>
                    <div className="text-sm text-blue-600">오늘 목표: 10,000걸음</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-green-900 flex items-center justify-center gap-2">
                      <Zap className="h-6 w-6" />
                      에너지
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-6xl font-bold text-green-600">87</div>
                    <div className="text-green-700">%</div>
                    <Badge className="bg-green-500 text-white">우수</Badge>
                    <div className="text-sm text-green-600">AI 분석 기반</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-yellow-900 flex items-center gap-3">
                      <Users className="h-6 w-6" />
                      커뮤니티 챌린지
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white/50 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">🏃‍♀️ 30일 걷기 챌린지</h4>
                      <div className="text-sm text-yellow-700 mb-3">참여자 2,847명</div>
                      <Progress value={23} className="h-3" />
                      <div className="text-xs text-yellow-600 mt-2">23일 남음</div>
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">🧘‍♀️ 명상 마스터</h4>
                      <div className="text-sm text-yellow-700 mb-3">참여자 1,523명</div>
                      <Progress value={67} className="h-3" />
                      <div className="text-xs text-yellow-600 mt-2">10일 남음</div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-3"
                      onClick={() => navigate('/challenges')}
                    >
                      챌린지 참여하기
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-teal-900 flex items-center gap-3">
                      <Star className="h-6 w-6" />
                      리더보드
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                          <span className="font-semibold text-yellow-900">김**님</span>
                        </div>
                        <div className="text-yellow-700">12,847 포인트</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                          <span className="font-semibold text-gray-900">이**님</span>
                        </div>
                        <div className="text-gray-700">11,203 포인트</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                          <span className="font-semibold text-orange-900">박**님</span>
                        </div>
                        <div className="text-orange-700">9,891 포인트</div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3"
                      onClick={() => navigate('/leaderboard')}
                    >
                      전체 랭킹 보기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            {isBetaTestPeriod() ? '🎉 베타테스트 무료 체험' : '지금 시작하세요'}
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            {isBetaTestPeriod() ? 
              '10월 31일까지 모든 프리미엄 기능을 무료로 이용하세요!' :
              '세계 최고 수준의 AI 웰니스 플랫폼을 경험해보세요'
            }
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button 
              className="bg-white text-purple-600 hover:bg-white/90 px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
              onClick={() => navigate('/assessment')}
            >
              무료 체험 시작하기
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg rounded-2xl w-full sm:w-auto"
              onClick={() => navigate('/pricing')}
            >
              요금제 보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WellnessLifestyle;
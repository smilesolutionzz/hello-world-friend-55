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
  FileText
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WellnessLifestyle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingRoutine, setLoadingRoutine] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  const handleStartDailyRoutine = async () => {
    setLoadingRoutine(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: { action: 'generate_daily_routine' },
      });
      if (error) throw error;
      toast({ title: 'AI 루틴 생성 완료', description: '오늘의 루틴이 준비됐어요.' });
      navigate('/daily-checkin');
    } catch (err: any) {
      console.error('오늘의 루틴 시작 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingRoutine(false);
    }
  };

  const handleJoinNewChallenge = async () => {
    setLoadingChallenge(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { action: 'suggest_challenge' },
      });
      if (error) throw error;
      toast({ title: '추천 챌린지 준비 완료', description: '당신에게 맞는 챌린지를 추천했어요.' });
      navigate('/challenges');
    } catch (err: any) {
      console.error('새 챌린지 참여 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingChallenge(false);
    }
  };

  // Additional CTA handlers with OpenAI functionality
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [constitutionResult, setConstitutionResult] = useState<string>('');
  const [beautyPlan, setBeautyPlan] = useState<string>('');
  const [biomarkerInfo, setBiomarkerInfo] = useState<string>('');
  const [loadingSupplements, setLoadingSupplements] = useState(false);
  const [loadingConstitution, setLoadingConstitution] = useState(false);
  const [loadingBeauty, setLoadingBeauty] = useState(false);
  const [loadingBiomarker, setLoadingBiomarker] = useState(false);

  const handleSupplementsDetail = async () => {
    setLoadingSupplements(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: { 
          action: 'supplements_analysis',
          prompt: '사용자의 연령 25세, 직장인, 운동량 보통, 스트레스 중간 정도를 고려한 맞춤형 영양제 상세 분석을 제공해주세요.'
        },
      });
      if (error) throw error;
      setAnalysisResult(data.response || '맞춤형 영양제 분석이 완료되었습니다.');
      toast({ title: '✨ 상세 분석 완료', description: '개인 맞춤형 영양제 추천을 확인해보세요!' });
    } catch (err: any) {
      console.error('상세 분석 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingSupplements(false);
    }
  };

  const handleConstitutionTest = async () => {
    setLoadingConstitution(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: { 
          action: 'constitution_analysis',
          prompt: '한의학 체질 진단을 위한 질문과 분석을 제공해주세요. 체질별 특징과 맞춤 건강관리법을 포함해주세요.'
        },
      });
      if (error) throw error;
      setConstitutionResult(data.response || '체질 분석이 완료되었습니다.');
      toast({ title: '🌿 체질 검사 완료', description: '당신의 체질에 맞는 건강법을 확인해보세요!' });
    } catch (err: any) {
      console.error('체질 검사 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingConstitution(false);
    }
  };

  const handleBeautyPlan = async () => {
    setLoadingBeauty(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: { 
          action: 'beauty_plan',
          prompt: '25세 여성을 위한 안티에이징 뷰티 플랜을 작성해주세요. 스킨케어, 영양, 생활습관을 포함한 종합적인 계획을 제공해주세요.'
        },
      });
      if (error) throw error;
      setBeautyPlan(data.response || '맞춤형 뷰티 플랜이 생성되었습니다.');
      toast({ title: '✨ 뷰티 플랜 완성', description: '당신만의 맞춤 뷰티 루틴을 확인해보세요!' });
    } catch (err: any) {
      console.error('뷰티 플랜 생성 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingBeauty(false);
    }
  };

  const handleBiomarkerBooking = async () => {
    setLoadingBiomarker(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: { 
          action: 'biomarker_info',
          prompt: '바이오마커 검사의 중요성과 추천 검사 항목, 주변 검사 기관 정보를 제공해주세요.'
        },
      });
      if (error) throw error;
      setBiomarkerInfo(data.response || '바이오마커 검사 정보가 준비되었습니다.');
      toast({ title: '🔬 바이오마커 검사 정보', description: '검사 정보와 예약 가이드를 확인해보세요!' });
    } catch (err: any) {
      console.error('바이오마커 정보 로드 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingBiomarker(false);
    }
  };

  const [fastingActive, setFastingActive] = useState(false);
  const [fastingStart, setFastingStart] = useState<number | null>(null);
  const [fastingElapsedText, setFastingElapsedText] = useState('14시간 30분');

  useEffect(() => {
    if (!fastingActive) return;
    if (!fastingStart) setFastingStart(Date.now());
    const start = fastingStart ?? Date.now();
    const update = () => {
      const diff = Date.now() - start;
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setFastingElapsedText(`${hrs}시간 ${mins}분`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [fastingActive, fastingStart]);

  const handleFastingTimerStart = () => {
    if (!fastingActive) {
      setFastingStart(Date.now());
      setFastingActive(true);
      toast({ title: '단식 타이머 시작', description: '지금부터 단식 시간을 기록합니다.' });
    } else {
      setFastingActive(false);
      toast({ title: '단식 타이머 중지', description: '기록을 일시 중지했어요.' });
    }
  };

  const [workoutPlan, setWorkoutPlan] = useState<string>('');
  const [sleepTips, setSleepTips] = useState<string>('');
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [loadingSleep, setLoadingSleep] = useState(false);

  const handleWorkoutStart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ 
        title: '로그인이 필요합니다', 
        description: '운동 계획을 받으시려면 먼저 로그인해주세요.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setLoadingWorkout(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', { 
        body: { 
          userId: user.id,
          action: 'workout_plan',
          prompt: '25세 직장인을 위한 30분 홈트레이닝 계획을 작성해주세요. 초보자도 쉽게 따라할 수 있는 운동으로 구성해주세요.'
        }
      });
      if (error) throw error;
      setWorkoutPlan(data.response || '맞춤형 운동 계획이 생성되었습니다.');
      toast({ title: '💪 오늘의 운동 시작', description: '맞춤형 운동 계획을 확인해보세요!' });
    } catch (err: any) {
      console.error('운동 시작 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingWorkout(false);
    }
  };

  const handleSleepTips = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ 
        title: '로그인이 필요합니다', 
        description: '수면 개선 가이드를 받으시려면 먼저 로그인해주세요.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setLoadingSleep(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-insights', { 
        body: { 
          userId: user.id,
          action: 'sleep_improvement',
          prompt: '직장인의 수면의 질 개선을 위한 구체적인 팁과 루틴을 제공해주세요. 스마트폰 사용, 카페인 섭취, 수면환경 등을 포함해주세요.'
        }
      });
      if (error) throw error;
      
      // Edge Function 응답 구조에 맞게 수정
      const insightContent = data.insights?.[0]?.content || data.response || '맞춤형 수면 개선 가이드가 준비되었습니다.';
      setSleepTips(insightContent);
      toast({ title: '😴 수면 개선 팁', description: '맞춤형 수면 가이드를 확인해보세요!' });
    } catch (err: any) {
      console.error('수면 팁 실패:', err);
      toast({ title: '문제가 발생했어요', description: err?.message ?? '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    } finally {
      setLoadingSleep(false);
    }
  };

  return (
    <div className="min-h-screen bg-modern">
      <Helmet>
        <title>라이프스타일 허브 - AI 기반 맞춤형 건강 관리</title>
        <meta name="description" content="AI 기반 개인 맞춤형 라이프 솔루션. 수면, 스트레스, 영양, 운동을 통합 관리하고 장수 건강 플랜을 받아보세요." />
      </Helmet>
      
      <UnifiedNavigation />
      
      <main className="pt-4 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">라이프 허브</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              나만의 건강 리포트 센터
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              AI 분석부터 전문가 검증까지, 모든 건강 리포트를 한 곳에서 확인하고 관리하세요
            </p>
          </section>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/assessment')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">심리 검사 받기</h3>
                <p className="text-sm text-gray-600 mb-4">3분만에 현재 마음 상태 체크</p>
                <Button size="sm" className="w-full">검사 시작</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">내 리포트 보기</h3>
                <p className="text-sm text-gray-600 mb-4">받은 모든 분석 결과 한눈에</p>
                <Button size="sm" className="w-full" variant="outline">리포트 열기</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/expert-hiring')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">전문가 상담</h3>
                <p className="text-sm text-gray-600 mb-4">전문의와 1:1 개인 상담</p>
                <Button size="sm" className="w-full" variant="outline">상담 신청</Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="health-analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
              <TabsTrigger value="health-analysis" className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                맞춤 건강 분석
              </TabsTrigger>
              <TabsTrigger value="wellness-plan" className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                라이프 플랜
              </TabsTrigger>
              <TabsTrigger value="my-reports" className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                내 리포트 모음
              </TabsTrigger>
            </TabsList>

            {/* 맞춤 건강 분석 */}
            <TabsContent value="health-analysis" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 영양제 추천 */}
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      맞춤형 영양제 추천
                    </CardTitle>
                    <p className="text-sm text-gray-600">AI 기반 개인 맞춤형 영양제 분석</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <div className="text-sm font-medium text-blue-900">오메가3</div>
                        <div className="text-xs text-blue-600">필수</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <div className="text-sm font-medium text-green-900">비타민D</div>
                        <div className="text-xs text-green-600">추천</div>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleSupplementsDetail} disabled={loadingSupplements}>
                      {loadingSupplements ? '분석 중...' : '상세 분석 받기'}
                    </Button>
                  </CardContent>
                </Card>

                {/* 뷰티 라이프케어 */}
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                      안티에이징 뷰티 플랜
                    </CardTitle>
                    <p className="text-sm text-gray-600">개인 맞춤 뷰티 루틴 & 영양 관리</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-purple-50 rounded text-center">
                        <div className="text-sm font-medium text-purple-900">콜라겐</div>
                        <div className="text-xs text-purple-600">탄력</div>
                      </div>
                      <div className="p-2 bg-pink-50 rounded text-center">
                        <div className="text-sm font-medium text-pink-900">비타민C</div>
                        <div className="text-xs text-pink-600">미백</div>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleBeautyPlan} disabled={loadingBeauty}>
                      {loadingBeauty ? '플랜 생성 중...' : '뷰티 플랜 만들기'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* 분석 결과 표시 영역 */}
              {(analysisResult || beautyPlan) && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    📋 분석 결과
                  </h3>
                  
                  {analysisResult && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className="h-5 w-5 text-blue-600" />
                          영양제 분석 리포트
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed">{analysisResult}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" onClick={() => navigate('/dashboard')}>
                            내 리포트에 저장
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setAnalysisResult('')}>
                            닫기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {beautyPlan && (
                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          뷰티 플랜 리포트
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed">{beautyPlan}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" onClick={() => navigate('/dashboard')}>
                            내 리포트에 저장
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setBeautyPlan('')}>
                            닫기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* 라이프 플랜 */}
            <TabsContent value="wellness-plan" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Dumbbell className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">운동 플랜</h3>
                    <p className="text-sm text-gray-600 mb-4">맞춤 홈트레이닝</p>
                    <Button size="sm" className="w-full" onClick={handleWorkoutStart} disabled={loadingWorkout}>
                      {loadingWorkout ? '생성 중...' : '운동 시작'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Moon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">수면 개선</h3>
                    <p className="text-sm text-gray-600 mb-4">수면 품질 향상</p>
                    <Button size="sm" className="w-full" onClick={handleSleepTips} disabled={loadingSleep}>
                      {loadingSleep ? '준비 중...' : '수면 가이드'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Timer className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">간헐적 단식</h3>
                    <p className="text-sm text-gray-600 mb-4">건강한 다이어트</p>
                    <Button size="sm" className="w-full" onClick={handleFastingTimerStart}>
                      {fastingActive ? '진행 중' : '타이머 시작'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* 플랜 결과 표시 */}
              {(workoutPlan || sleepTips) && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    🎯 내 라이프 플랜
                  </h3>
                  
                  {workoutPlan && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-green-600" />
                          운동 계획
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{workoutPlan}</p>
                      </CardContent>
                    </Card>
                  )}

                  {sleepTips && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Moon className="h-5 w-5 text-blue-600" />
                          수면 개선 가이드
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{sleepTips}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* 내 리포트 모음 */}
            <TabsContent value="my-reports" className="space-y-6">
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">모든 리포트를 한 곳에서</h3>
                <p className="text-gray-600 mb-6">받은 분석 결과와 플랜들을 체계적으로 관리하세요</p>
                <Button onClick={() => navigate('/dashboard')}>
                  내 리포트 대시보드로 이동
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default WellnessLifestyle;
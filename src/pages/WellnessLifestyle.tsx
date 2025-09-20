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
  Users
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30">
      <Helmet>
        <title>웰니스 라이프스타일 허브 - AI 기반 맞춤형 건강 관리</title>
        <meta name="description" content="AI 기반 개인 맞춤형 웰니스 솔루션. 수면, 스트레스, 영양, 운동을 통합 관리하고 장수 건강 플랜을 받아보세요." />
      </Helmet>
      
      <UnifiedNavigation />
      
      <main className="pt-4 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">MZ세대를 위한 웰니스 혁명</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              웰니스 라이프스타일 허브
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              AI 기반 개인 맞춤형 건강 관리로 당신의 웰니스 여정을 시작하세요. 
              디지털 라이프스타일 플래너부터 장수 건강 솔루션까지, 모든 것을 한 곳에서.
            </p>
          </section>

          {/* Main Tabs */}
          <Tabs defaultValue="lifestyle" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="lifestyle" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                라이프스타일 플래너
              </TabsTrigger>
              <TabsTrigger value="functional" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                기능성 건강
              </TabsTrigger>
              <TabsTrigger value="longevity" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                장수 & 체중관리
              </TabsTrigger>
            </TabsList>

            {/* 라이프스타일 플래너 */}
            <TabsContent value="lifestyle" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI 맞춤형 일상 루틴
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">오늘의 웰니스 점수</span>
                        <Badge variant="secondary">85%</Badge>
                      </div>
                      <Progress value={85} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Moon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="text-sm font-medium">수면</div>
                          <div className="text-xs text-muted-foreground">7.5시간</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
                          <div className="text-sm font-medium">운동</div>
                          <div className="text-xs text-muted-foreground">45분</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Apple className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                          <div className="text-sm font-medium">영양</div>
                          <div className="text-xs text-muted-foreground">균형식</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                          <div className="text-sm font-medium">스트레스</div>
                          <div className="text-xs text-muted-foreground">낮음</div>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" onClick={handleStartDailyRoutine} disabled={loadingRoutine}>
                        {loadingRoutine ? '생성 중...' : '오늘의 루틴 시작하기'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-secondary" />
                      소셜 웰니스 챌린지
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                        <h4 className="font-medium mb-2">🏃‍♀️ 30일 걷기 챌린지</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          친구들과 함께 매일 1만보 걷기 도전!
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">진행률</span>
                          <span className="text-sm font-medium">15/30일</span>
                        </div>
                        <Progress value={50} className="h-2 mt-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">1위</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">김민지</div>
                            <div className="text-xs text-muted-foreground">12,450보</div>
                          </div>
                          <Badge variant="outline">🏆</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">2위</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">나 (이서준)</div>
                            <div className="text-xs text-muted-foreground">11,280보</div>
                          </div>
                          <Badge variant="outline">🥈</Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full" onClick={handleJoinNewChallenge} disabled={loadingChallenge}>
                        {loadingChallenge ? '준비 중...' : '새 챌린지 참여하기'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 기능성 건강 솔루션 */}
            <TabsContent value="functional" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-blue-500" />
                      맞춤형 영양제
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        AI 분석 기반 개인 맞춤형 영양제 추천
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">오메가3</span>
                          <Badge variant="secondary">추천</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">비타민D</span>
                          <Badge variant="secondary">추천</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">마그네슘</span>
                          <Badge variant="outline">선택</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        상세 분석 받기
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      한방차 처방
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        체질과 현재 상태에 맞는 한방차 추천
                      </p>
                      <div className="space-y-2">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-sm font-medium">소양인 맞춤차</div>
                          <div className="text-xs text-muted-foreground">열을 내리고 진정 효과</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-sm font-medium">스트레스 완화차</div>
                          <div className="text-xs text-muted-foreground">감국, 라벤더 블렌드</div>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        체질 검사하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      뷰티 웰니스
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        안티에이징과 뷰티를 위한 통합 케어
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-muted/30 rounded text-center">
                          <div className="font-medium">콜라겐</div>
                          <div className="text-muted-foreground">피부탄력</div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded text-center">
                          <div className="font-medium">히알루론산</div>
                          <div className="text-muted-foreground">수분공급</div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded text-center">
                          <div className="font-medium">비타민C</div>
                          <div className="text-muted-foreground">미백효과</div>
                        </div>
                        <div className="p-2 bg-muted/30 rounded text-center">
                          <div className="font-medium">레스베라트롤</div>
                          <div className="text-muted-foreground">항산화</div>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        뷰티 플랜 만들기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 장수 & 체중관리 */}
            <TabsContent value="longevity" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      GLP-1 체중 관리
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        최신 GLP-1 약물과 전문가 상담을 통한 안전한 체중 관리
                      </p>
                      
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                        <h4 className="font-medium mb-2">🎯 목표 체중 달성률</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">현재: 70kg → 목표: 65kg</span>
                          <span className="text-sm font-medium">60% 달성</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">전문의 상담</span>
                          <Button size="sm" variant="outline">예약</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">약물 처방 상담</span>
                          <Button size="sm" variant="outline">문의</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">식단 관리 코칭</span>
                          <Button size="sm" variant="outline">시작</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      장수 건강 플랜
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        바이오마커 분석과 예방의학 기반 장수 건강 관리
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="text-sm font-medium">생체나이</div>
                          <div className="text-xs text-muted-foreground">23세 (실제 26세)</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                          <div className="text-sm font-medium">에너지</div>
                          <div className="text-xs text-muted-foreground">최적</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                          <div className="text-sm font-medium">심혈관</div>
                          <div className="text-xs text-muted-foreground">양호</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Brain className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                          <div className="text-sm font-medium">인지능력</div>
                          <div className="text-xs text-muted-foreground">우수</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button className="w-full">
                          바이오마커 검사 예약
                        </Button>
                        <Button variant="outline" className="w-full">
                          장수 플랜 상담받기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 추가 기능들 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Timer className="h-5 w-5 text-orange-500" />
                      간헐적 단식
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      16:8 패턴으로 건강한 다이어트와 세포 재생
                    </p>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-4">
                      <div className="text-sm font-medium">오늘의 단식 시간</div>
                      <div className="text-lg font-bold text-orange-600">14시간 30분</div>
                      <Progress value={90} className="h-2 mt-2" />
                    </div>
                    <Button size="sm" className="w-full">
                      단식 타이머 시작
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Dumbbell className="h-5 w-5 text-green-500" />
                      운동 최적화
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI 기반 개인 맞춤형 운동 프로그램
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>유산소</span>
                        <span>30분</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>근력운동</span>
                        <span>45분</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>스트레칭</span>
                        <span>15분</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">
                      오늘의 운동 시작
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-purple-500" />
                      수면 최적화
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      수면 패턴 분석과 품질 개선 솔루션
                    </p>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                      <div className="text-sm font-medium">어젯밤 수면 점수</div>
                      <div className="text-lg font-bold text-purple-600">85점</div>
                      <div className="text-xs text-muted-foreground">깊은잠 3시간 32분</div>
                    </div>
                    <Button size="sm" className="w-full">
                      수면 개선 팁 보기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default WellnessLifestyle;
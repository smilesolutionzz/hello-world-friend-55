import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TestSelector } from '@/components/highlight/TestSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LogOut, History, Crown, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ImprovementHistory from '@/components/improvement/ImprovementHistory';
import { PersonalityAnalysis } from '@/components/dashboard/PersonalityAnalysis';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { GoalTracker } from '@/components/dashboard/GoalTracker';

interface Profile {
  display_name: string;
  subscription_tier: string;
}

interface RecentTest {
  id: string;
  completed_at: string;
  scores: any;
  test_types: {
    name: string;
  };
}

interface Observation {
  id: string;
  created_at: string;
  age_group: string;
  score_overall: number;
  categoryScores?: { [key: string]: number };
}

export default function HighlightDashboard() {
  const { authenticated, loading: authLoading } = useAuthGuard();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const loadData = async () => {
    try {
      await fetchProfile();
      await fetchRecentTests();
      await fetchObservations();
    } catch (error) {
      console.error('Data loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "프로필 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchRecentTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // test_results 테이블에서 프리미엄 검사 결과 조회
      const { data: testResults, error: testError } = await supabase
        .from('test_results')
        .select(`
          id,
          completed_at,
          scores,
          test_types (name)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (testError) throw testError;

      // assessments 테이블에서 프리미엄 검사 결과도 조회
      const { data: assessmentResults, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          id,
          created_at,
          results,
          analysis
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (assessmentError) throw assessmentError;

      // 두 결과를 합쳐서 최근 순으로 정렬
      const allTests = [
        ...(testResults || []).map(test => ({
          ...test,
          scores: test.scores || { total_score: 0 },
          test_types: test.test_types || { name: '검사' }
        })),
        ...(assessmentResults || []).map(assessment => ({
          id: assessment.id,
          completed_at: assessment.created_at,
          scores: { 
            total_score: typeof assessment.results === 'object' && assessment.results 
              ? Object.values(assessment.results as Record<string, any>).reduce((sum, val) => sum + (Number(val) || 0), 0) / Object.keys(assessment.results as Record<string, any>).length || 0
              : 0 
          },
          test_types: { name: '프리미엄 검사' }
        }))
      ].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).slice(0, 5);

      setRecentTests(allTests);
    } catch (error: any) {
      toast({
        title: "최근 검사 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchObservations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('observation_sessions')
        .select('id, created_at, observations, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match ImprovementHistory interface
      const transformedData: Observation[] = (data || []).map((obs: any) => {
        const categoryScores: { [key: string]: number } = {};
        
        // observation_sessions의 observations는 Json 타입이므로 파싱
        if (obs.observations && typeof obs.observations === 'object') {
          const obsData = obs.observations as any;
          if (obsData.score_emotion) categoryScores['정서'] = obsData.score_emotion;
          if (obsData.score_cognition) categoryScores['인지'] = obsData.score_cognition;
          if (obsData.score_physical) categoryScores['신체'] = obsData.score_physical;
          if (obsData.score_social) categoryScores['사회성'] = obsData.score_social;
          if (obsData.score_behavior) categoryScores['행동'] = obsData.score_behavior;
        }
        
        return {
          id: obs.id,
          created_at: obs.created_at,
          age_group: 'general',
          score_overall: Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length || 0,
          categoryScores
        };
      });
      
      setObservations(transformedData);
    } catch (error: any) {
      console.error('Error fetching observations:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-950">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="mr-2" />
                <h1 className="text-2xl font-bold text-white">
                  개인 대시보드
                </h1>
                {profile && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-200">{profile.display_name || '사용자'}</span>
                    <Badge variant={profile.subscription_tier === 'premium' ? 'default' : 'secondary'}>
                      {profile.subscription_tier === 'premium' ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          프리미엄
                        </>
                      ) : (
                        '무료'
                      )}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/subscription')}
                >
                  구독 관리
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            </div>
          </div>

          <main className="flex-1 bg-slate-950">
            <div className="container mx-auto px-4 py-8">
              <Tabs defaultValue="tests" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="tests" className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    검사 시작
                  </TabsTrigger>
                  <TabsTrigger value="improvement" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    개선 이력
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tests" className="space-y-6">
                  {/* 통계 카드 섹션 */}
                  <DashboardStats 
                    recentTests={recentTests}
                    observations={observations}
                  />
                  
                  {/* 목표 추적 섹션 */}
                  <GoalTracker />
                  
                  {/* 차트 섹션 */}
                  <DashboardCharts 
                    recentTests={recentTests}
                    observations={observations}
                  />
                  
                  {/* AI 성격 분석 섹션 */}
                  <PersonalityAnalysis 
                    testData={recentTests}
                    observations={observations}
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                      <TestSelector />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Recent Tests */}
                      <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-white">
                            <History className="w-5 h-5" />
                            최근 검사
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            최근 완료한 검사 결과를 확인하세요
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {recentTests.length > 0 ? (
                            <div className="space-y-3">
                              {recentTests.map((test) => (
                                <div 
                                  key={test.id}
                                  className="p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors"
                                  onClick={() => {
                                    if (test.test_types.name === '프리미엄 검사') {
                                      navigate(`/assessment-detail/${test.id}`);
                                    } else {
                                      navigate(`/assessment/${test.id}`);
                                    }
                                  }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-sm text-slate-200">{test.test_types.name}</p>
                                      <p className="text-xs text-slate-500">
                                        {new Date(test.completed_at).toLocaleDateString('ko-KR')}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                                      {test.scores.total_score || 0}점
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 text-center py-4">
                              아직 완료한 검사가 없습니다
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Subscription Info */}
                      {profile?.subscription_tier === 'free' && (
                        <Card className="bg-slate-900 border-slate-800">
                          <CardHeader>
                            <CardTitle className="text-white">프리미엄 업그레이드</CardTitle>
                            <CardDescription className="text-slate-400">
                              더 많은 기능을 이용해보세요
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2 mb-4 text-slate-300">
                              <li>• 무제한 검사</li>
                              <li>• 전문가 피드백</li>
                              <li>• PDF 리포트 다운로드</li>
                              <li>• 카카오 알림톡</li>
                            </ul>
                            <Button 
                              className="w-full"
                              onClick={() => navigate('/subscription')}
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              프리미엄 구독하기
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="improvement">
                  <ImprovementHistory observations={observations} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

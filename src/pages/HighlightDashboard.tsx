import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VisualSummaryCard from '@/components/visual-summary/VisualSummaryCard';
import { TestSelector } from '@/components/highlight/TestSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LogOut, History, Crown, TrendingUp, Brain, Activity, MessageSquare, Settings, RotateCcw, GripVertical, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PersonalityAnalysis } from '@/components/dashboard/PersonalityAnalysis';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { GoalTracker } from '@/components/dashboard/GoalTracker';
import { ThreeBackground } from '@/components/dashboard/ThreeBackground';
import { TestComparison } from '@/components/dashboard/TestComparison';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';
import { useDashboardWidgets, WidgetType } from '@/hooks/useDashboardWidgets';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  isCustomizing: boolean;
}

function SortableWidget({ id, children, isCustomizing }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {isCustomizing && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing bg-purple-600/80 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={isCustomizing ? 'pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
}

function DashboardContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [visualNotes, setVisualNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { widgets, reorderWidgets, toggleWidget, resetWidgets } = useDashboardWidgets();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      
      const newOrder = arrayMove(widgets, oldIndex, newIndex).map((widget, index) => ({
        ...widget,
        order: index,
      }));
      
      reorderWidgets(newOrder);
      
      toast({
        title: "위젯 순서 변경됨",
        description: "대시보드 레이아웃이 업데이트되었습니다.",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchProfile();
      await fetchRecentTests();
      await fetchObservations();
      await fetchVisualNotes();
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
        .maybeSingle();

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

  const fetchVisualNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('visual_notes' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setVisualNotes(data || []);
    } catch (error: any) {
      console.error('Error fetching visual notes:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ThreeBackground />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative">
          {/* Header - 모바일 최적화 */}
          <div className="border-b border-purple-500/20 bg-gradient-to-r from-slate-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-xl shadow-lg shadow-purple-500/10 sticky top-0 z-40">
            <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
              {/* 첫 번째 줄: 메인 네비게이션 */}
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-0">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <SidebarTrigger className="shrink-0 lg:text-purple-300 lg:hover:text-white lg:hover:bg-purple-500/20 lg:rounded-lg lg:p-2 text-white bg-primary hover:bg-primary/90 p-2 rounded-lg shadow-md lg:shadow-none" />
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent truncate">
                    개인 대시보드
                  </h1>
                  {profile && (
                    <div className="hidden lg:flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-200">{profile.display_name || '사용자'}</span>
                      <Badge variant={profile.subscription_tier === 'premium' ? 'default' : 'secondary'} className="text-xs">
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
                
                {/* 데스크탑 버튼들 */}
                <div className="hidden md:flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 backdrop-blur-sm"
                      >
                        <Settings className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">대시보드 설정</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-900/95 border-purple-500/30">
                      <DropdownMenuLabel className="text-purple-200">위젯 관리</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-purple-500/20" />
                      <DropdownMenuItem 
                        onClick={() => setIsCustomizing(!isCustomizing)}
                        className="text-purple-300 focus:bg-purple-500/20 focus:text-purple-200"
                      >
                        <GripVertical className="w-4 h-4 mr-2" />
                        {isCustomizing ? '편집 완료' : '위젯 재배치'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={resetWidgets}
                        className="text-purple-300 focus:bg-purple-500/20 focus:text-purple-200"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        초기화
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/subscription')}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 backdrop-blur-sm"
                  >
                    <span className="hidden lg:inline">구독 관리</span>
                    <Crown className="w-4 h-4 lg:hidden" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="text-purple-300 hover:bg-purple-500/20"
                  >
                    <LogOut className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">로그아웃</span>
                  </Button>
                </div>

                {/* 모바일 메뉴 버튼 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="md:hidden">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 shrink-0"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900/95 border-purple-500/30 w-48">
                    {profile && (
                      <>
                        <DropdownMenuLabel className="text-purple-200">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="truncate">{profile.display_name || '사용자'}</span>
                          </div>
                          <Badge variant={profile.subscription_tier === 'premium' ? 'default' : 'secondary'} className="mt-1">
                            {profile.subscription_tier === 'premium' ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                프리미엄
                              </>
                            ) : (
                              '무료'
                            )}
                          </Badge>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-purple-500/20" />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={() => setIsCustomizing(!isCustomizing)}
                      className="text-purple-300 focus:bg-purple-500/20 focus:text-purple-200"
                    >
                      <GripVertical className="w-4 h-4 mr-2" />
                      {isCustomizing ? '편집 완료' : '위젯 재배치'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={resetWidgets}
                      className="text-purple-300 focus:bg-purple-500/20 focus:text-purple-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      초기화
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-purple-500/20" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/subscription')}
                      className="text-purple-300 focus:bg-purple-500/20 focus:text-purple-200"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      구독 관리
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-red-400 focus:bg-red-500/20 focus:text-red-300"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <main className="flex-1 relative">
            <div className="container mx-auto px-4 py-8">
              <Tabs defaultValue="tests" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 max-w-md bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 shadow-lg shadow-purple-500/10">
                  <TabsTrigger 
                    value="tests" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                  >
                    <History className="w-4 h-4" />
                    대시보드
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tests" className="space-y-4 sm:space-y-6">
                  {/* 빠른 시작 CTA 섹션 - 고정 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <Card 
                      className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 backdrop-blur-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer group"
                      onClick={() => navigate('/assessment')}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors shrink-0">
                            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent truncate">종합 검사</h3>
                            <p className="text-xs sm:text-sm text-blue-300/70 truncate">전문 심리검사 시작하기</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 cursor-pointer group"
                      onClick={() => navigate('/simple-observation')}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors shrink-0">
                            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent truncate">바로 검사</h3>
                            <p className="text-xs sm:text-sm text-emerald-300/70 truncate">1분 빠른 체크</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer group sm:col-span-2 lg:col-span-1"
                      onClick={() => navigate('/premium-assessment')}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors shrink-0">
                            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent truncate">프리미엄 검사</h3>
                            <p className="text-xs sm:text-sm text-purple-300/70 truncate">AI 심층 분석</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 드래그 가능한 위젯들 */}
                  {isCustomizing && (
                    <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/40">
                      <CardContent className="p-4">
                        <p className="text-sm text-purple-200 flex items-center gap-2">
                          <GripVertical className="w-4 h-4" />
                          위젯 옆의 아이콘을 드래그해서 순서를 변경하세요
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={widgets.filter(w => w.enabled).map(w => w.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-6">
                        {widgets.filter(w => w.enabled).map((widget) => (
                          <SortableWidget key={widget.id} id={widget.id} isCustomizing={isCustomizing}>
                            {widget.id === 'stats' && (
                              <DashboardStats 
                                recentTests={recentTests}
                                observations={observations}
                              />
                            )}
                            {widget.id === 'timeline' && (
                              <ActivityTimeline
                                recentTests={recentTests}
                                observations={observations}
                              />
                            )}
                            {widget.id === 'comparison' && (
                              <TestComparison 
                                recentTests={recentTests}
                                observations={observations}
                              />
                            )}
                            {widget.id === 'goals' && <GoalTracker />}
                            {widget.id === 'charts' && (
                              <DashboardCharts 
                                recentTests={recentTests}
                                observations={observations}
                              />
                            )}
                            {widget.id === 'personality' && (
                              <PersonalityAnalysis 
                                testData={recentTests}
                                observations={observations}
                              />
                            )}
                            {widget.id === 'recent' && (
                              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                    <History className="w-5 h-5 text-purple-400" />
                                    최근 검사
                                  </CardTitle>
                                  <CardDescription className="text-purple-300/70">
                                    최근 완료한 검사 결과를 확인하세요
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {recentTests.length > 0 ? (
                                    <div className="space-y-3">
                                      {recentTests.slice(0, 3).map((test) => (
                                        <div 
                                          key={test.id}
                                          className="p-3 border border-purple-500/20 rounded-lg cursor-pointer hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-blue-500/10 transition-all"
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
                                              <p className="font-medium text-sm text-white">{test.test_types.name}</p>
                                              <p className="text-xs text-purple-400/70">
                                                {new Date(test.completed_at).toLocaleDateString('ko-KR')}
                                              </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs border-purple-500/30 bg-purple-500/10 text-purple-300">
                                              {test.scores.total_score || 0}점
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500/30" />
                                      <p className="text-sm text-purple-400/60 mb-4">아직 완료한 검사가 없습니다</p>
                                      <Button 
                                        onClick={() => navigate('/assessment')}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                                      >
                                        첫 검사 시작하기
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                            {widget.id === 'recommendations' && (
                              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    추천 기능
                                  </CardTitle>
                                  <CardDescription className="text-purple-300/70">
                                    맞춤형 검사 및 기능 추천
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div 
                                    className="p-3 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-emerald-500/10 transition-all"
                                    onClick={() => navigate('/metaverse-voice')}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm text-white">메타버스 음성 상담</p>
                                        <p className="text-xs text-purple-400/70">실시간 AI 상담 체험</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div 
                                    className="p-3 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/10 transition-all"
                                    onClick={() => navigate('/observation')}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm text-white">관찰 기록하기</p>
                                        <p className="text-xs text-purple-400/70">일상 행동 기록 및 분석</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div 
                                    className="p-3 border border-amber-500/20 rounded-lg cursor-pointer hover:bg-amber-500/10 transition-all"
                                    onClick={() => navigate('/stress-test')}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <Brain className="w-5 h-5 text-amber-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm text-white">스트레스 검사</p>
                                        <p className="text-xs text-purple-400/70">현재 스트레스 수준 체크</p>
                                      </div>
                                    </div>
                                  </div>

                                  {profile?.subscription_tier === 'free' && (
                                    <div className="pt-2 border-t border-purple-500/20">
                                      <Button 
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                        onClick={() => navigate('/subscription')}
                                      >
                                        <Crown className="w-4 h-4 mr-2" />
                                        프리미엄 구독하기
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                            {widget.id === 'visual_notes' && (
                              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                    <ImageIcon className="w-5 h-5 text-violet-400" />
                                    비주얼 노트
                                  </CardTitle>
                                  <CardDescription className="text-purple-300/70">
                                    AI 상담·분석에서 생성한 비주얼 노트
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {visualNotes.length > 0 ? (
                                    <div className="space-y-3">
                                      {visualNotes.slice(0, 5).map((note: any) => (
                                        <div
                                          key={note.id}
                                          className="p-3 border border-violet-500/20 rounded-lg cursor-pointer hover:bg-violet-500/10 transition-all"
                                          onClick={() => setSelectedNote(note)}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm text-white truncate">{note.title}</p>
                                              <p className="text-xs text-purple-400/70">
                                                {new Date(note.created_at).toLocaleDateString('ko-KR')} · {note.source_type === 'counseling' ? '상담' : '검사'}
                                              </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs border-violet-500/30 bg-violet-500/10 text-violet-300 shrink-0">
                                              🎨
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-violet-500/30" />
                                      <p className="text-sm text-purple-400/60 mb-4">아직 비주얼 노트가 없습니다</p>
                                      <Button
                                        onClick={() => navigate('/metaverse-voice')}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600"
                                      >
                                        AI 상담에서 만들기
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </SortableWidget>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
      {/* 비주얼 노트 상세 보기 다이얼로그 */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">🎨 비주얼 노트</DialogTitle>
          </DialogHeader>
          {selectedNote?.summary_data && (
            <VisualSummaryCard
              data={selectedNote.summary_data}
              backgroundImage={selectedNote.background_image_url}
              onClose={() => setSelectedNote(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default function HighlightDashboard() {
  return (
    <AuthenticationGuard 
      fallbackMessage="개인 대시보드를 이용하려면 로그인이 필요합니다."
      redirectPath="/auth"
    >
      <DashboardContent />
    </AuthenticationGuard>
  );
}

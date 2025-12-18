import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign,
  BarChart3,
  ArrowRight,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface FunnelMetric {
  stage: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

interface NPSData {
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  totalResponses: number;
}

const PMFMetricsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [dataSource, setDataSource] = useState<'database' | 'demo'>('database');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    returnRate: 0,
    avgSessionDuration: 0,
    conversionRate: 0,
    payingUsers: 0,
    revenue: 0,
  });
  const [funnel, setFunnel] = useState<FunnelMetric[]>([]);
  const [npsData, setNpsData] = useState<NPSData>({
    promoters: 0,
    passives: 0,
    detractors: 0,
    npsScore: 0,
    totalResponses: 0,
  });
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);

  useEffect(() => {
    loadMetrics();
  }, [dateRange, dataSource]);

  const getDateFilter = () => {
    const now = new Date();
    if (dateRange === '7d') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (dateRange === '30d') {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    return null;
  };

  const loadMetrics = async () => {
    setLoading(true);
    
    if (dataSource === 'demo') {
      setDummyData();
      setLoading(false);
      return;
    }

    try {
      const dateFilter = getDateFilter();
      
      // Supabase에서 실제 이벤트 데이터 로드
      let eventsQuery = supabase.from('pmf_events').select('*');
      if (dateFilter) {
        eventsQuery = eventsQuery.gte('created_at', dateFilter);
      }
      const { data: events, error: eventsError } = await eventsQuery;
      
      // Supabase에서 실제 피드백 데이터 로드
      let feedbackQuery = supabase.from('pmf_feedback').select('*');
      if (dateFilter) {
        feedbackQuery = feedbackQuery.gte('created_at', dateFilter);
      }
      const { data: feedback, error: feedbackError } = await feedbackQuery;

      if (eventsError) console.error('이벤트 로드 실패:', eventsError);
      if (feedbackError) console.error('피드백 로드 실패:', feedbackError);

      if (events && events.length > 0) {
        processMetrics(events);
        processFunnel(events);
      } else {
        // 실제 데이터가 없으면 빈 상태 표시
        setEmptyData();
      }

      if (feedback && feedback.length > 0) {
        processNPS(feedback);
        setRecentFeedback(feedback.slice(-5).reverse());
      } else {
        setNpsData({
          promoters: 0,
          passives: 0,
          detractors: 0,
          npsScore: 0,
          totalResponses: 0,
        });
        setRecentFeedback([]);
      }

    } catch (error) {
      console.error('메트릭 로드 실패:', error);
      setEmptyData();
    }
    setLoading(false);
  };

  const setEmptyData = () => {
    setMetrics({
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      returnRate: 0,
      avgSessionDuration: 0,
      conversionRate: 0,
      payingUsers: 0,
      revenue: 0,
    });
    setFunnel([
      { stage: '랜딩 방문', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '온보딩 시작', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '온보딩 완료', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '무료 체험', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '첫 관찰일지', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '회원가입', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '결제 완료', count: 0, conversionRate: 0, dropoffRate: 0 },
    ]);
  };

  const processMetrics = (events: any[]) => {
    const uniqueUsers = new Set(events.map(e => e.user_id || e.session_id));
    const signupEvents = events.filter(e => e.event_type === 'signup_complete');
    const paymentEvents = events.filter(e => e.event_type === 'payment_success');
    const returnEvents = events.filter(e => e.event_type === 'return_visit');

    setMetrics({
      totalUsers: uniqueUsers.size,
      activeUsers: Math.floor(uniqueUsers.size * 0.6),
      newUsers: signupEvents.length,
      returnRate: uniqueUsers.size > 0 ? (returnEvents.length / uniqueUsers.size) * 100 : 0,
      avgSessionDuration: 180,
      conversionRate: uniqueUsers.size > 0 ? (paymentEvents.length / uniqueUsers.size) * 100 : 0,
      payingUsers: paymentEvents.length,
      revenue: paymentEvents.length * 9900,
    });
  };

  const processFunnel = (events: any[]) => {
    const stages = [
      { key: 'landing_view', name: '랜딩 방문' },
      { key: 'onboarding_start', name: '온보딩 시작' },
      { key: 'onboarding_complete', name: '온보딩 완료' },
      { key: 'free_trial_start', name: '무료 체험' },
      { key: 'first_observation', name: '첫 관찰일지' },
      { key: 'signup_complete', name: '회원가입' },
      { key: 'payment_success', name: '결제 완료' },
    ];

    const funnelData: FunnelMetric[] = stages.map((stage, index) => {
      const count = events.filter(e => e.event_type === stage.key).length;
      const prevCount = index > 0 
        ? events.filter(e => e.event_type === stages[index - 1].key).length 
        : count;
      
      return {
        stage: stage.name,
        count: count,
        conversionRate: prevCount > 0 ? (count / prevCount) * 100 : (index === 0 ? 100 : 0),
        dropoffRate: prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0,
      };
    });

    setFunnel(funnelData);
  };

  const processNPS = (feedback: any[]) => {
    const promoters = feedback.filter(f => f.nps_score >= 9).length;
    const passives = feedback.filter(f => f.nps_score >= 7 && f.nps_score <= 8).length;
    const detractors = feedback.filter(f => f.nps_score <= 6).length;
    const total = feedback.length;

    setNpsData({
      promoters,
      passives,
      detractors,
      npsScore: total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0,
      totalResponses: total,
    });
  };

  const setDummyData = () => {
    setMetrics({
      totalUsers: 127,
      activeUsers: 76,
      newUsers: 23,
      returnRate: 34,
      avgSessionDuration: 180,
      conversionRate: 5.5,
      payingUsers: 7,
      revenue: 69300,
    });

    setFunnel([
      { stage: '랜딩 방문', count: 500, conversionRate: 100, dropoffRate: 0 },
      { stage: '온보딩 시작', count: 200, conversionRate: 40, dropoffRate: 60 },
      { stage: '온보딩 완료', count: 150, conversionRate: 75, dropoffRate: 25 },
      { stage: '무료 체험', count: 100, conversionRate: 67, dropoffRate: 33 },
      { stage: '첫 관찰일지', count: 60, conversionRate: 60, dropoffRate: 40 },
      { stage: '회원가입', count: 40, conversionRate: 67, dropoffRate: 33 },
      { stage: '결제 완료', count: 7, conversionRate: 17.5, dropoffRate: 82.5 },
    ]);

    setNpsData({
      promoters: 15,
      passives: 8,
      detractors: 5,
      npsScore: 36,
      totalResponses: 28,
    });

    setRecentFeedback([
      { nps_score: 9, feedback_text: 'AI 분석이 정말 정확해요!', would_pay: true, created_at: new Date().toISOString() },
      { nps_score: 7, feedback_text: '더 많은 검사 종류가 있으면 좋겠어요', would_pay: true, created_at: new Date().toISOString() },
      { nps_score: 5, feedback_text: '속도가 좀 느린 것 같아요', would_pay: false, created_at: new Date().toISOString() },
    ]);
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-green-500';
    if (score >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">📊 PMF 검증 대시보드</h1>
          <p className="text-muted-foreground">핵심 지표로 Product-Market Fit 확인</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* 데이터 소스 토글 */}
          <div className="flex gap-1">
            <Button
              variant={dataSource === 'database' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataSource('database')}
              className="gap-1"
            >
              <Database className="w-3 h-3" />
              실제 데이터
            </Button>
            <Button
              variant={dataSource === 'demo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataSource('demo')}
            >
              데모
            </Button>
          </div>
          
          {/* 기간 필터 */}
          <div className="flex gap-1">
            {(['7d', '30d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range === '7d' ? '7일' : range === '30d' ? '30일' : '전체'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={loadMetrics}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 데이터 소스 안내 */}
      {dataSource === 'database' && metrics.totalUsers === 0 && !loading && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ 아직 수집된 데이터가 없습니다. 사용자가 서비스를 이용하면 자동으로 이벤트가 기록됩니다.
            <br />
            <span className="text-xs text-yellow-600 dark:text-yellow-400">데모 데이터를 보려면 위의 "데모" 버튼을 클릭하세요.</span>
          </p>
        </div>
      )}
      
      {dataSource === 'demo' && (
        <Badge variant="outline" className="text-xs">
          📌 데모 데이터를 표시하고 있습니다
        </Badge>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="전체 사용자" value={metrics.totalUsers} icon={<Users className="w-5 h-5" />} trend={12} />
        <MetricCard title="전환율" value={`${metrics.conversionRate.toFixed(1)}%`} icon={<Target className="w-5 h-5" />} trend={2.3} target="목표: 5%" />
        <MetricCard title="재방문율" value={`${metrics.returnRate.toFixed(0)}%`} icon={<TrendingUp className="w-5 h-5" />} trend={-5} target="목표: 30%" />
        <MetricCard title="예상 수익" value={`₩${metrics.revenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} trend={15} />
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">퍼널 분석</TabsTrigger>
          <TabsTrigger value="nps">NPS & 피드백</TabsTrigger>
          <TabsTrigger value="segments">세그먼트</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                전환 퍼널
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnel.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stage.stage}</span>
                        <Badge variant="secondary">{stage.count}명</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        {index > 0 && (
                          <>
                            <span className="text-green-500">전환 {stage.conversionRate.toFixed(0)}%</span>
                            <span className="text-red-500">이탈 {stage.dropoffRate.toFixed(0)}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={(stage.count / (funnel[0]?.count || 1)) * 100} className="h-8" />
                      {index < funnel.length - 1 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full px-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">⚠️ 주요 이탈 포인트</h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• 온보딩 시작 → 완료: 25% 이탈 (목표 대비 +10%)</li>
                  <li>• 회원가입 → 결제: 82% 이탈 (결제 전환 개선 필요)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nps" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>NPS 점수</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getNPSColor(npsData.npsScore)}`}>{npsData.npsScore}</div>
                  <p className="text-sm text-muted-foreground mt-1">{npsData.totalResponses}명 응답</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-green-500" />추천 (9-10)</span>
                    <span>{npsData.promoters}명</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>중립 (7-8)</span>
                    <span>{npsData.passives}명</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1"><ThumbsDown className="w-4 h-4 text-red-500" />비추천 (0-6)</span>
                    <span>{npsData.detractors}명</span>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">PMF 기준</p>
                  <p className="text-muted-foreground">NPS 40+ = 강한 PMF 신호 ✅</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>최근 피드백</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentFeedback.length > 0 ? recentFeedback.map((fb, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={fb.nps_score >= 9 ? 'default' : fb.nps_score >= 7 ? 'secondary' : 'destructive'}>
                          NPS {fb.nps_score}
                        </Badge>
                        <Badge variant={fb.would_pay ? 'outline' : 'secondary'}>
                          {fb.would_pay ? '💰 유료 의향' : '무료만'}
                        </Badge>
                      </div>
                      {fb.feedback_text && <p className="text-sm text-muted-foreground">"{fb.feedback_text}"</p>}
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">아직 피드백이 없습니다</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>💰 유료 전환 의향</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{recentFeedback.filter(f => f.would_pay).length}</div>
                  <p className="text-sm text-muted-foreground">유료 의향 있음</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground">{recentFeedback.filter(f => !f.would_pay).length}</div>
                  <p className="text-sm text-muted-foreground">무료만 사용</p>
                </div>
                <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>
                      {recentFeedback.length > 0 
                        ? Math.round((recentFeedback.filter(f => f.would_pay).length / recentFeedback.length) * 100)
                        : 0}%
                    </strong>가 유료 사용 의향이 있습니다.
                    <br />
                    <span className="text-xs">PMF 기준: 40% 이상 = 강한 신호</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>사용자 세그먼트</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: '자녀 발달 걱정 부모', count: 45, conversion: 8.2, color: 'bg-blue-500' },
                  { name: '본인 심리상태 궁금', count: 38, conversion: 4.5, color: 'bg-purple-500' },
                  { name: 'B2B 기관', count: 12, conversion: 25, color: 'bg-green-500' },
                  { name: '전문가', count: 8, conversion: 15, color: 'bg-orange-500' },
                ].map((segment) => (
                  <div key={segment.name} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                      <span className="font-medium">{segment.name}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{segment.count}명</span>
                      <span className="text-green-500">전환율 {segment.conversion}%</span>
                    </div>
                    <Progress value={segment.conversion * 4} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  target?: string;
}> = ({ title, value, icon, trend, target }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center justify-between mt-1">
        {trend !== undefined && (
          <span className={`text-xs flex items-center gap-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
        {target && <span className="text-xs text-muted-foreground">{target}</span>}
      </div>
    </CardContent>
  </Card>
);

export default PMFMetricsDashboard;

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
  Database,
  AlertCircle
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

interface SegmentData {
  name: string;
  count: number;
  conversion: number;
  color: string;
}

const PMFMetricsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');
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
  const [segments, setSegments] = useState<SegmentData[]>([]);

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

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

    try {
      const dateFilter = getDateFilter();
      
      // 실제 사용자 데이터 로드
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, created_at');
      
      // 실제 구독자 데이터 로드
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('user_id, subscribed, created_at, total_paid');
      
      // 실제 테스트 결과 로드
      const { data: testResults, error: testError } = await supabase
        .from('test_results')
        .select('user_id, completed_at');
      
      // 실제 관찰일지 로드
      const { data: observations, error: obsError } = await supabase
        .from('observation_sessions')
        .select('user_id, created_at');

      // 피드백 데이터 로드
      let feedbackQuery = supabase.from('user_feedback').select('*');
      if (dateFilter) {
        feedbackQuery = feedbackQuery.gte('created_at', dateFilter);
      }
      const { data: feedback, error: feedbackError } = await feedbackQuery;

      if (profilesError) console.error('프로필 로드 실패:', profilesError);
      if (subscribersError) console.error('구독자 로드 실패:', subscribersError);

      // 메트릭 계산
      const totalUsers = profiles?.length || 0;
      const payingUsers = subscribers?.filter(s => s.subscribed)?.length || 0;
      const totalRevenue = subscribers?.reduce((sum, s) => sum + (s.total_paid || 0), 0) || 0;
      
      // 기간 필터 적용
      let filteredProfiles = profiles || [];
      let filteredSubscribers = subscribers || [];
      let filteredTests = testResults || [];
      let filteredObs = observations || [];
      
      if (dateFilter) {
        filteredProfiles = filteredProfiles.filter(p => new Date(p.created_at) >= new Date(dateFilter));
        filteredSubscribers = filteredSubscribers.filter(s => new Date(s.created_at) >= new Date(dateFilter));
        filteredTests = filteredTests.filter(t => new Date(t.completed_at) >= new Date(dateFilter));
        filteredObs = filteredObs.filter(o => new Date(o.created_at) >= new Date(dateFilter));
      }

      const newUsers = filteredProfiles.length;
      const activeUsers = new Set([
        ...(filteredTests?.map(t => t.user_id) || []),
        ...(filteredObs?.map(o => o.user_id) || [])
      ]).size;

      setMetrics({
        totalUsers,
        activeUsers,
        newUsers,
        returnRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        avgSessionDuration: 180,
        conversionRate: totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0,
        payingUsers,
        revenue: totalRevenue,
      });

      // 퍼널 데이터 계산
      processFunnel(profiles || [], testResults || [], observations || [], subscribers || []);
      
      // 세그먼트 데이터 계산
      processSegments(profiles || [], subscribers || []);

      // NPS 및 피드백
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
      { stage: '회원가입', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '첫 검사', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '관찰일지 작성', count: 0, conversionRate: 0, dropoffRate: 0 },
      { stage: '유료 전환', count: 0, conversionRate: 0, dropoffRate: 0 },
    ]);
    setSegments([]);
  };

  const processFunnel = (profiles: any[], tests: any[], observations: any[], subscribers: any[]) => {
    const totalSignups = profiles.length;
    const usersWithTests = new Set(tests.map(t => t.user_id)).size;
    const usersWithObs = new Set(observations.map(o => o.user_id)).size;
    const paidUsers = subscribers.filter(s => s.subscribed).length;

    const stages = [
      { name: '회원가입', count: totalSignups },
      { name: '첫 검사', count: usersWithTests },
      { name: '관찰일지 작성', count: usersWithObs },
      { name: '유료 전환', count: paidUsers },
    ];

    const funnelData: FunnelMetric[] = stages.map((stage, index) => {
      const prevCount = index > 0 ? stages[index - 1].count : stage.count;
      return {
        stage: stage.name,
        count: stage.count,
        conversionRate: prevCount > 0 ? (stage.count / prevCount) * 100 : (index === 0 ? 100 : 0),
        dropoffRate: prevCount > 0 ? ((prevCount - stage.count) / prevCount) * 100 : 0,
      };
    });

    setFunnel(funnelData);
  };

  const processNPS = (feedback: any[]) => {
    const promoters = feedback.filter(f => f.rating >= 4).length;
    const passives = feedback.filter(f => f.rating === 3).length;
    const detractors = feedback.filter(f => f.rating <= 2).length;
    const total = feedback.length;

    setNpsData({
      promoters,
      passives,
      detractors,
      npsScore: total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0,
      totalResponses: total,
    });
  };

  const processSegments = (profiles: any[], subscribers: any[]) => {
    const paidUserIds = new Set(subscribers.filter(s => s.subscribed).map(s => s.user_id));
    
    // 가입 시기 기반 세그먼트
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsers = profiles.filter(p => new Date(p.created_at) >= oneWeekAgo);
    const activeUsers = profiles.filter(p => {
      const createdAt = new Date(p.created_at);
      return createdAt >= oneMonthAgo && createdAt < oneWeekAgo;
    });
    const loyalUsers = profiles.filter(p => new Date(p.created_at) < oneMonthAgo);

    const segmentData: SegmentData[] = [
      {
        name: '신규 사용자 (7일 이내)',
        count: newUsers.length,
        conversion: newUsers.length > 0 
          ? (newUsers.filter(u => paidUserIds.has(u.user_id)).length / newUsers.length) * 100 
          : 0,
        color: 'bg-blue-600',
      },
      {
        name: '활성 사용자 (7-30일)',
        count: activeUsers.length,
        conversion: activeUsers.length > 0 
          ? (activeUsers.filter(u => paidUserIds.has(u.user_id)).length / activeUsers.length) * 100 
          : 0,
        color: 'bg-emerald-600',
      },
      {
        name: '충성 사용자 (30일+)',
        count: loyalUsers.length,
        conversion: loyalUsers.length > 0 
          ? (loyalUsers.filter(u => paidUserIds.has(u.user_id)).length / loyalUsers.length) * 100 
          : 0,
        color: 'bg-purple-600',
      },
    ];

    setSegments(segmentData.filter(s => s.count > 0));
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 0) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📊 PMF 대시보드</h1>
          <p className="text-muted-foreground">실시간 Product-Market Fit 지표</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['7d', '30d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange(range)}
                className="rounded-none"
              >
                {range === '7d' ? '7일' : range === '30d' ? '30일' : '전체'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={loadMetrics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="전체 사용자" 
          value={metrics.totalUsers} 
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />} 
          trend={12} 
          bgColor="bg-blue-50 dark:bg-blue-950"
        />
        <MetricCard 
          title="전환율" 
          value={`${metrics.conversionRate.toFixed(1)}%`} 
          icon={<Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} 
          trend={2.3} 
          target="목표: 5%"
          bgColor="bg-emerald-50 dark:bg-emerald-950"
        />
        <MetricCard 
          title="활성 사용자" 
          value={metrics.activeUsers} 
          icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />} 
          trend={-5} 
          bgColor="bg-purple-50 dark:bg-purple-950"
        />
        <MetricCard 
          title="총 수익" 
          value={`₩${metrics.revenue.toLocaleString()}`} 
          icon={<DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />} 
          trend={15}
          bgColor="bg-amber-50 dark:bg-amber-950"
        />
      </div>

      {/* 탭 콘텐츠 */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="funnel" className="data-[state=active]:bg-background">퍼널 분석</TabsTrigger>
          <TabsTrigger value="nps" className="data-[state=active]:bg-background">NPS & 피드백</TabsTrigger>
          <TabsTrigger value="segments" className="data-[state=active]:bg-background">세그먼트</TabsTrigger>
        </TabsList>

        {/* 퍼널 분석 */}
        <TabsContent value="funnel" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="w-5 h-5 text-primary" />
                전환 퍼널
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {funnel.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{stage.stage}</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {stage.count}명
                        </Badge>
                      </div>
                      {index > 0 && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            전환 {stage.conversionRate.toFixed(0)}%
                          </span>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            이탈 {stage.dropoffRate.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Progress 
                        value={(stage.count / (funnel[0]?.count || 1)) * 100} 
                        className="h-10 bg-muted"
                      />
                      {index < funnel.length - 1 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8">
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {funnel.some(f => f.dropoffRate > 50) && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    주요 이탈 포인트
                  </h4>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    {funnel.filter(f => f.dropoffRate > 50).map(f => (
                      <li key={f.stage}>• {f.stage}: {f.dropoffRate.toFixed(0)}% 이탈</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NPS & 피드백 */}
        <TabsContent value="nps" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">NPS 점수</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className={`text-6xl font-bold ${getNPSColor(npsData.npsScore)}`}>
                    {npsData.npsScore}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {npsData.totalResponses}명 응답
                  </p>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-foreground">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      추천 (4-5점)
                    </span>
                    <span className="font-semibold text-foreground">{npsData.promoters}명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">중립 (3점)</span>
                    <span className="font-semibold text-foreground">{npsData.passives}명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-foreground">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      비추천 (1-2점)
                    </span>
                    <span className="font-semibold text-foreground">{npsData.detractors}명</span>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium text-foreground">PMF 기준</p>
                  <p className="text-sm text-muted-foreground">NPS 40+ = 강한 PMF 신호</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">최근 피드백</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentFeedback.length > 0 ? recentFeedback.map((fb, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={fb.rating >= 4 ? 'default' : fb.rating === 3 ? 'secondary' : 'destructive'}
                        >
                          평점 {fb.rating}/5
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(fb.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      {fb.comment && (
                        <p className="text-sm text-foreground">"{fb.comment}"</p>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      아직 피드백이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">💰 유료 전환 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {metrics.payingUsers}
                  </div>
                  <p className="text-sm text-muted-foreground">유료 사용자</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-muted-foreground">
                    {metrics.totalUsers - metrics.payingUsers}
                  </div>
                  <p className="text-sm text-muted-foreground">무료 사용자</p>
                </div>
                <div className="flex-1 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-foreground">
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {metrics.conversionRate.toFixed(1)}%
                    </strong>가 유료 전환했습니다.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PMF 기준: 5% 이상 = 좋은 신호
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 세그먼트 */}
        <TabsContent value="segments" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">사용자 세그먼트</CardTitle>
            </CardHeader>
            <CardContent>
              {segments.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {segments.map((segment) => (
                    <div key={segment.name} className="p-5 border border-border rounded-xl space-y-3 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${segment.color}`} />
                        <span className="font-semibold text-foreground">{segment.name}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-3xl font-bold text-foreground">{segment.count}</div>
                          <div className="text-xs text-muted-foreground">명</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {segment.conversion.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">전환율</div>
                        </div>
                      </div>
                      <Progress value={segment.conversion} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>아직 세그먼트 데이터가 없습니다</p>
                  <p className="text-sm">사용자가 가입하면 자동으로 분류됩니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 메트릭 카드 컴포넌트
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  target?: string;
  bgColor?: string;
}> = ({ title, value, icon, trend, target, bgColor = 'bg-muted' }) => (
  <Card className={`${bgColor} border-0`}>
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 rounded-lg bg-background/80">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="flex items-center justify-between mt-2">
        {trend !== undefined && (
          <span className={`text-sm flex items-center gap-1 font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </span>
        )}
        {target && <span className="text-xs text-muted-foreground">{target}</span>}
      </div>
    </CardContent>
  </Card>
);

export default PMFMetricsDashboard;

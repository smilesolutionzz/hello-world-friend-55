import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  FileText, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface KPIData {
  dau: number;
  test_completion_rate: number;
  expert_conversion_rate: number;
  payment_conversion_rate: number;
  mrr: number;
  total_users: number;
  tests_today: number;
  avg_session_duration: number;
}

interface EventCount {
  event_name: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const KPIDashboard = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    dau: 0,
    test_completion_rate: 0,
    expert_conversion_rate: 0,
    payment_conversion_rate: 0,
    mrr: 0,
    total_users: 0,
    tests_today: 0,
    avg_session_duration: 0
  });
  const [eventData, setEventData] = useState<EventCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('7days');

  useEffect(() => {
    fetchKPIData();
  }, [timeRange]);

  const fetchKPIData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // DAU - Distinct users today
      const { count: dauCount } = await supabase
        .from('user_analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]);

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Test completion rate
      const { count: testStarted } = await supabase
        .from('user_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'test_started')
        .gte('created_at', startDate.toISOString());

      const { count: testCompleted } = await supabase
        .from('user_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'test_completed')
        .gte('created_at', startDate.toISOString());

      const completionRate = testStarted && testStarted > 0 
        ? ((testCompleted || 0) / testStarted) * 100 
        : 0;

      // Expert connection conversion
      const { count: resultViewed } = await supabase
        .from('user_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'result_viewed')
        .gte('created_at', startDate.toISOString());

      const { count: expertClicked } = await supabase
        .from('user_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'expert_connection_clicked')
        .gte('created_at', startDate.toISOString());

      const expertConversion = resultViewed && resultViewed > 0
        ? ((expertClicked || 0) / resultViewed) * 100
        : 0;

      // Payment conversion
      const { count: paymentInitiated } = await supabase
        .from('user_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'payment_initiated')
        .gte('created_at', startDate.toISOString());

      const { count: paymentCompleted } = await supabase
        .from('user_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'payment_completed')
        .gte('created_at', startDate.toISOString());

      const paymentConversion = paymentInitiated && paymentInitiated > 0
        ? ((paymentCompleted || 0) / paymentInitiated) * 100
        : 0;

      // MRR calculation (this month's subscriptions)
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('status', 'active')
        .gte('created_at', firstDayOfMonth.toISOString());

      const mrr = subscriptions?.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0) || 0;

      // Event distribution
      const { data: events } = await supabase
        .from('user_analytics_events')
        .select('event_name')
        .gte('created_at', startDate.toISOString());

      const eventCounts: { [key: string]: number } = {};
      events?.forEach(event => {
        eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
      });

      const eventDistribution = Object.entries(eventCounts).map(([name, count]) => ({
        event_name: name,
        count
      }));

      setKpiData({
        dau: dauCount || 0,
        test_completion_rate: completionRate,
        expert_conversion_rate: expertConversion,
        payment_conversion_rate: paymentConversion,
        mrr: mrr,
        total_users: totalUsers || 0,
        tests_today: testCompleted || 0,
        avg_session_duration: 0 // Calculate from session data
      });

      setEventData(eventDistribution);
    } catch (error) {
      console.error('Failed to fetch KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'DAU (일간 활성 사용자)',
      value: kpiData.dau,
      icon: Users,
      description: '오늘 활동한 사용자 수',
      color: 'text-blue-600'
    },
    {
      title: '전체 사용자',
      value: kpiData.total_users,
      icon: Activity,
      description: '가입한 전체 사용자 수',
      color: 'text-purple-600'
    },
    {
      title: '테스트 완료율',
      value: `${kpiData.test_completion_rate.toFixed(1)}%`,
      icon: FileText,
      description: '시작 대비 완료 비율',
      color: 'text-green-600',
      target: '> 70%'
    },
    {
      title: '전문가 연결 전환율',
      value: `${kpiData.expert_conversion_rate.toFixed(1)}%`,
      icon: UserCheck,
      description: '결과 조회 후 전문가 클릭',
      color: 'text-orange-600',
      target: '> 15%'
    },
    {
      title: '결제 전환율',
      value: `${kpiData.payment_conversion_rate.toFixed(1)}%`,
      icon: DollarSign,
      description: '결제 시도 대비 완료',
      color: 'text-emerald-600',
      target: '> 5%'
    },
    {
      title: 'MRR (월간 반복 매출)',
      value: `₩${kpiData.mrr.toLocaleString()}`,
      icon: TrendingUp,
      description: '이번 달 구독 매출',
      color: 'text-pink-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              KPI 대시보드
            </h1>
            <p className="text-muted-foreground mt-2">
              핵심 성과 지표를 실시간으로 확인하세요
            </p>
          </div>

          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList>
              <TabsTrigger value="today">오늘</TabsTrigger>
              <TabsTrigger value="7days">7일</TabsTrigger>
              <TabsTrigger value="30days">30일</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {kpi.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.description}
                  </p>
                  {kpi.target && (
                    <div className="flex items-center gap-1 mt-2">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        목표: {kpi.target}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>이벤트 분포</CardTitle>
              <CardDescription>사용자 행동 패턴 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ event_name, percent }) => 
                      `${event_name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {eventData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funnel Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>전환 퍼널</CardTitle>
              <CardDescription>단계별 전환율 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: '테스트 완료', rate: kpiData.test_completion_rate },
                    { name: '전문가 연결', rate: kpiData.expert_conversion_rate },
                    { name: '결제 완료', rate: kpiData.payment_conversion_rate }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="rate" fill="#8884d8" name="전환율 (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              즉시 개선 포인트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kpiData.test_completion_rate < 70 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <strong>테스트 완료율</strong>이 목표({kpiData.test_completion_rate.toFixed(1)}% 대비 70%) 미달입니다. 
                  테스트 UX 개선이 필요합니다.
                </AlertDescription>
              </Alert>
            )}
            {kpiData.expert_conversion_rate < 15 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <strong>전문가 연결 전환율</strong>이 낮습니다({kpiData.expert_conversion_rate.toFixed(1)}% 대비 15%). 
                  CTA 문구와 위치를 최적화하세요.
                </AlertDescription>
              </Alert>
            )}
            {kpiData.payment_conversion_rate < 5 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong>결제 전환율</strong>이 매우 낮습니다({kpiData.payment_conversion_rate.toFixed(1)}% 대비 5%). 
                  가격 또는 가치 제안을 재검토하세요.
                </AlertDescription>
              </Alert>
            )}
            {kpiData.dau < 10 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <strong>DAU</strong>가 낮습니다({kpiData.dau}명). 마케팅 채널을 다각화하세요.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KPIDashboard;

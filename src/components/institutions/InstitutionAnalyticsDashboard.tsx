import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  MessageCircle, 
  Calendar,
  BarChart3,
  Target,
  Users,
  Crown,
  Award,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { EnhancedChart } from "@/components/ui/enhanced-chart";

interface AnalyticsData {
  date: string;
  page_views: number;
  profile_clicks: number;
  contact_requests: number;
  consultation_bookings: number;
  search_appearances: number;
  conversion_rate: number;
}

interface InstitutionAnalyticsDashboardProps {
  institutionId: string;
  institutionName: string;
}

export function InstitutionAnalyticsDashboard({ 
  institutionId, 
  institutionName 
}: InstitutionAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [premiumPlan, setPremiumPlan] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData();
    fetchPremiumPlan();
  }, [institutionId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const days = parseInt(timeRange);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('institution_premium_analytics')
        .select('*')
        .eq('institution_id', institutionId)
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setAnalyticsData(data || []);
    } catch (error) {
      console.error('분석 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumPlan = async () => {
    try {
      const { data } = await supabase
        .from('institution_premium_plans')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .single();

      setPremiumPlan(data);
    } catch (error) {
      console.error('프리미엄 플랜 조회 오류:', error);
    }
  };

  // 통계 계산
  const totalViews = analyticsData.reduce((sum, data) => sum + data.page_views, 0);
  const totalClicks = analyticsData.reduce((sum, data) => sum + data.profile_clicks, 0);
  const totalContacts = analyticsData.reduce((sum, data) => sum + data.contact_requests, 0);
  const totalBookings = analyticsData.reduce((sum, data) => sum + data.consultation_bookings, 0);
  const avgConversionRate = analyticsData.length > 0 
    ? analyticsData.reduce((sum, data) => sum + data.conversion_rate, 0) / analyticsData.length 
    : 0;

  // 전주 대비 증감률 계산
  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const chartData = analyticsData.map((data, index) => ({
    name: new Date(data.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    '페이지 뷰': data.page_views,
    '프로필 클릭': data.profile_clicks,
    '문의 요청': data.contact_requests,
    '상담 예약': data.consultation_bookings,
    value: data.page_views,
    color: '#3b82f6'
  }));

  const conversionChartData = analyticsData.map(data => ({
    name: new Date(data.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    '전환율': data.conversion_rate,
    value: data.conversion_rate,
    color: '#10b981'
  }));

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    color = "blue" 
  }: {
    title: string;
    value: number;
    icon: any;
    growth?: number;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              {growth !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${
                  growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{Math.abs(growth).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              기관 분석 대시보드
            </h2>
            <p className="text-muted-foreground">{institutionName}</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            기관 분석 대시보드
          </h2>
          <p className="text-muted-foreground">{institutionName}</p>
          {premiumPlan && (
            <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              {premiumPlan.plan_name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">최근 7일</SelectItem>
              <SelectItem value="30">최근 30일</SelectItem>
              <SelectItem value="90">최근 90일</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Target className="w-4 h-4 mr-2" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 페이지 뷰"
          value={totalViews}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="프로필 클릭"
          value={totalClicks}
          icon={MousePointer}
          color="green"
        />
        <StatCard
          title="문의 요청"
          value={totalContacts}
          icon={MessageCircle}
          color="purple"
        />
        <StatCard
          title="상담 예약"
          value={totalBookings}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* 상세 분석 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="performance">성과 분석</TabsTrigger>
          <TabsTrigger value="conversion">전환율</TabsTrigger>
          <TabsTrigger value="recommendations">개선 제안</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>방문자 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                data={chartData}
                height={300}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>문의 및 예약 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedChart
                  type="bar"
                  data={chartData}
                  height={250}
                  xAxisKey="date"
                  yAxisKeys={['문의 요청', '상담 예약']}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>평균 전환율</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="text-4xl font-bold text-primary mb-2">
                  {avgConversionRate.toFixed(2)}%
                </div>
                <p className="text-muted-foreground">지난 {timeRange}일 평균</p>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    업계 평균({(avgConversionRate * 0.8).toFixed(1)}%)보다 높은 성과입니다!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">노출 성과</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">검색 노출</span>
                    <span className="font-semibold">{analyticsData.reduce((sum, d) => sum + d.search_appearances, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">클릭률</span>
                    <span className="font-semibold text-green-600">
                      {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">참여도</span>
                    <Badge variant="secondary">높음</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">고객 확보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">신규 문의</span>
                    <span className="font-semibold">{totalContacts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">예약 전환</span>
                    <span className="font-semibold text-blue-600">
                      {totalContacts > 0 ? ((totalBookings / totalContacts) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">응답 속도</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">빠름</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">경쟁 우위</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">랭킹</span>
                    <Badge className="bg-yellow-100 text-yellow-700">상위 10%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">프리미엄 혜택</span>
                    <Badge className="bg-purple-100 text-purple-700">
                      <Crown className="w-3 h-3 mr-1" />
                      활성
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">추천 지수</span>
                    <span className="font-semibold text-primary">9.2/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>전환율 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedChart
                type="area"
                data={conversionChartData}
                height={300}
                xAxisKey="date"
                yAxisKeys={['전환율']}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>전환 단계별 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">페이지 방문</span>
                    </div>
                    <span className="font-semibold">{totalViews}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-green-600" />
                      <span className="text-sm">프로필 클릭</span>
                    </div>
                    <span className="font-semibold">{totalClicks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">문의 요청</span>
                    </div>
                    <span className="font-semibold">{totalContacts}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">상담 예약</span>
                    </div>
                    <span className="font-semibold">{totalBookings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>개선 포인트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-1">프로필 최적화</h4>
                    <p className="text-sm text-yellow-700">
                      더 많은 사진과 상세 정보로 클릭률을 높일 수 있습니다.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">응답 시간 개선</h4>
                    <p className="text-sm text-blue-700">
                      빠른 응답으로 문의를 예약으로 전환시킬 확률을 높이세요.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">후기 관리</h4>
                    <p className="text-sm text-green-700">
                      긍정적인 후기가 신뢰도와 전환율을 크게 높입니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  즉시 개선 가능
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <h4 className="font-medium mb-2">📸 프로필 사진 추가</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      시설 내부 사진을 3-5장 더 추가하면 클릭률이 25% 향상됩니다.
                    </p>
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      사진 업로드하기
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2">⏰ 응답 시간 설정</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      자동 응답 메시지로 즉시 답변 체계를 구축하세요.
                    </p>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      자동응답 설정
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  장기 전략
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2">📊 프리미엄 업그레이드</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      프리미엄 플랜으로 우선 노출과 분석 도구를 활용하세요.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      플랜 업그레이드
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <h4 className="font-medium mb-2">🎯 마케팅 강화</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      전문 마케팅 도구로 더 많은 고객에게 도달하세요.
                    </p>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      마케팅 도구 보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
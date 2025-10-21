import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  LogOut,
  Heart,
  User,
  UserCheck,
  BarChart3,
  FileText,
  Home,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FamilyManagement from "@/components/family/FamilyManagement";
import AssessmentHistory from "@/components/history/AssessmentHistory";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, Legend, XAxis, YAxis } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

interface Profile {
  id: string;
  display_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  role: string;
  avatar_url?: string;
}

interface Observation {
  id: string;
  user_id: string;
  age_group: string;
  tags: string[];
  score_overall: number;
  created_at: string;
  profile?: Profile;
  categoryScores?: { [key: string]: number };
}

const DashboardNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    end: new Date()
  });

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile({ ...profileData, role: 'user' } as any);

      // Load assessments
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const allObservations: Observation[] = [];

      assessmentData?.forEach((assessment: any) => {
        let totalScore = 75;
        let categoryScores = { 정서: 75, 행동: 75, 인지: 75, 사회성: 75, 신체: 75 };
        
        if (assessment.results && typeof assessment.results === 'object') {
          if (assessment.results.total) {
            totalScore = assessment.results.total;
          } else if (assessment.results.totalScore) {
            totalScore = assessment.results.totalScore;
          }
          
          if (assessment.results.categories) {
            categoryScores = assessment.results.categories;
          }
        }
        
        allObservations.push({
          id: assessment.id,
          user_id: user.id,
          age_group: assessment.age_group,
          tags: ['검사', assessment.age_group],
          score_overall: totalScore,
          created_at: assessment.created_at,
          profile: { ...profileData, role: 'user' } as any,
          categoryScores
        });
      });

      allObservations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setObservations(allObservations);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // 기간별 필터링된 검사 데이터
  const filteredObservations = observations.filter(obs => {
    const obsDate = new Date(obs.created_at);
    return obsDate >= dateRange.start && obsDate <= dateRange.end;
  });

  const recent30DaysObservations = observations.filter(obs => {
    const obsDate = new Date(obs.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return obsDate >= thirtyDaysAgo;
  }).length;

  // 월별 검사 데이터 집계
  const monthlyData = React.useMemo(() => {
    const monthlyMap = new Map<string, { month: string; count: number; cumulative: number }>();
    
    filteredObservations.forEach(obs => {
      const date = new Date(obs.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, count: 0, cumulative: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.count += 1;
    });

    let cumulative = 0;
    const sortedMonths = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    sortedMonths.forEach(month => {
      cumulative += month.count;
      month.cumulative = cumulative;
    });

    return sortedMonths;
  }, [filteredObservations]);

  // 영역별 분포 데이터
  const distributionData = React.useMemo(() => {
    if (filteredObservations.length === 0) {
      return [
        { name: '정서', value: 0, color: '#0ea5e9', description: '감정 조절 및 표현 능력' },
        { name: '행동', value: 0, color: '#10b981', description: '적응적 행동 패턴' },
        { name: '인지', value: 0, color: '#f59e0b', description: '사고력 및 학습 능력' },
        { name: '사회성', value: 0, color: '#8b5cf6', description: '대인관계 및 소통 능력' },
        { name: '신체', value: 0, color: '#ef4444', description: '신체 발달 및 건강 상태' }
      ];
    }

    const totals = { 정서: 0, 행동: 0, 인지: 0, 사회성: 0, 신체: 0 };
    const counts = { 정서: 0, 행동: 0, 인지: 0, 사회성: 0, 신체: 0 };

    filteredObservations.forEach(obs => {
      if (obs.categoryScores) {
        Object.keys(totals).forEach(category => {
          const score = obs.categoryScores[category];
          if (score !== undefined) {
            totals[category as keyof typeof totals] += Number(score);
            counts[category as keyof typeof counts] += 1;
          }
        });
      }
    });

    return [
      { name: '정서', value: Math.round(totals.정서 / Math.max(counts.정서, 1)), color: '#0ea5e9', description: '감정 조절 및 표현 능력' },
      { name: '행동', value: Math.round(totals.행동 / Math.max(counts.행동, 1)), color: '#10b981', description: '적응적 행동 패턴' },
      { name: '인지', value: Math.round(totals.인지 / Math.max(counts.인지, 1)), color: '#f59e0b', description: '사고력 및 학습 능력' },
      { name: '사회성', value: Math.round(totals.사회성 / Math.max(counts.사회성, 1)), color: '#8b5cf6', description: '대인관계 및 소통 능력' },
      { name: '신체', value: Math.round(totals.신체 / Math.max(counts.신체, 1)), color: '#ef4444', description: '신체 발달 및 건강 상태' }
    ];
  }, [filteredObservations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      <UnifiedNavigation />
      
      {/* Header */}
      <header className="bg-white border-b border-border/40 lg:block hidden">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="w-4 h-4" />
                홈으로
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">가족 케어 대시보드</h1>
                <p className="text-sm text-muted-foreground">안녕하세요, {profile?.display_name}님</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/ai-counselor')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                AI 상담
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/assessment')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                진단하기
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-12 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">AI와 전문가가 함께하는 예방 케어</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            나의 건강 데이터
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            발달·심리 건강을 예방적으로 관리하고, 변화를 조기 감지합니다
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-auto p-1 bg-muted/50">
            <TabsTrigger value="overview" className="py-3">
              <div className="flex flex-col items-center gap-1">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">검사 데이터</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="py-3">
              <div className="flex flex-col items-center gap-1">
                <FileText className="w-5 h-5" />
                <span className="text-sm">검사 이력</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="family" className="py-3">
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5" />
                <span className="text-sm">가족 관리</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 기간 선택 */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex gap-2 items-center">
                    <input
                      type="month"
                      value={`${dateRange.start.getFullYear()}-${String(dateRange.start.getMonth() + 1).padStart(2, '0')}`}
                      onChange={(e) => {
                        const [year, month] = e.target.value.split('-');
                        setDateRange({
                          ...dateRange,
                          start: new Date(parseInt(year), parseInt(month) - 1, 1)
                        });
                      }}
                      className="px-3 py-2 border rounded-md bg-background"
                    />
                    <span>~</span>
                    <input
                      type="month"
                      value={`${dateRange.end.getFullYear()}-${String(dateRange.end.getMonth() + 1).padStart(2, '0')}`}
                      onChange={(e) => {
                        const [year, month] = e.target.value.split('-');
                        setDateRange({
                          ...dateRange,
                          end: new Date(parseInt(year), parseInt(month), 0)
                        });
                      }}
                      className="px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={loadDashboardData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새로고침
                </Button>
              </div>
            </Card>

            {/* 누적 측정 수 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">누적 측정 수</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground mb-1">전체 누적검사</p>
                  <p className="text-3xl font-bold">{filteredObservations.length}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-muted-foreground mb-1">이달 검사</p>
                  <p className="text-3xl font-bold">{recent30DaysObservations}</p>
                </div>
              </div>
            </Card>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* 월별 누적 추이 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">누적 추이</h3>
                <p className="text-sm text-muted-foreground mb-4">검사 수 누적 추이</p>
                {monthlyData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#10b981" name="월별 검사 수" />
                        <Bar dataKey="cumulative" fill="#fbbf24" name="누적 검사 수" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <p>📊 데이터가 없습니다</p>
                  </div>
                )}
              </Card>

              {/* 취약점 분포 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">취약점 분포</h3>
                <p className="text-sm text-muted-foreground mb-4">검사 영역별 분포</p>
                {distributionData.some(item => item.value > 0) ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <p>📊 데이터가 없습니다</p>
                  </div>
                )}
              </Card>
            </div>

            {/* 인사이트 카드 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">인사이트</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {distributionData
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
                  .map((item) => (
                    <Card key={item.name} className="p-6 border-2" style={{ borderColor: item.color }}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{item.name} 높은 그룹</h4>
                        <Badge variant="secondary">{filteredObservations.length}명</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description} 영역에서 관심이 필요합니다
                      </p>
                      <div className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value}점
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/assessment')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">새로운 검사 시작</h3>
                    <p className="text-sm text-muted-foreground">AI 기반 발달·심리 검사로 현재 상태를 확인하세요</p>
                    <Button className="mt-4" size="sm">
                      검사 시작하기
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200" onClick={() => navigate('/concern-storage')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">고민 저장소</h3>
                    <p className="text-sm text-muted-foreground">저장된 고민과 AI 분석 결과를 확인하세요</p>
                    <Button className="mt-4" size="sm" variant="outline">
                      고민 보기
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/experts')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">전문가 상담</h3>
                    <p className="text-sm text-muted-foreground">검사 결과를 바탕으로 전문가와 1:1 상담하세요</p>
                    <Button className="mt-4" size="sm" variant="outline">
                      전문가 찾기
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentHistory />
          </TabsContent>

          <TabsContent value="family">
            <FamilyManagement onUpdate={loadDashboardData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardNew;

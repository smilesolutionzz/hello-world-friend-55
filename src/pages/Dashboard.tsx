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
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavigation />
      
      {/* Simplified Header */}
      <header className="bg-white border-b border-border/40 lg:block hidden">
        <div className="container mx-auto px-8 py-5 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{profile?.display_name}님</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <Home className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 max-w-7xl">

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-white border shadow-sm p-1">
            <TabsTrigger value="overview" className="rounded-md px-6 py-2 text-sm font-medium">
              검사 데이터
            </TabsTrigger>
            <TabsTrigger value="assessments" className="rounded-md px-6 py-2 text-sm font-medium">
              검사 이력
            </TabsTrigger>
            <TabsTrigger value="family" className="rounded-md px-6 py-2 text-sm font-medium">
              가족 관리
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 기간 선택 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">누적 측정 수</span>
                  <div className="flex gap-2 items-center text-sm">
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
                      className="px-3 py-2 border rounded-lg bg-background hover:border-primary/50 transition-colors"
                    />
                    <span className="text-muted-foreground">~</span>
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
                      className="px-3 py-2 border rounded-lg bg-background hover:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={loadDashboardData} className="hover:bg-muted">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 통계 카드 */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">전체 누적검사</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{filteredObservations.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {String(dateRange.end.getMonth() + 1).padStart(2, '0')}월 누적검사
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{recent30DaysObservations}</p>
                </div>
              </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* 월별 누적 추이 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
                <h3 className="text-base font-semibold mb-1 text-foreground">누적 추이</h3>
                <p className="text-sm text-muted-foreground mb-6">월별 검사 수 및 누적 추이</p>
                {monthlyData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          tickLine={false}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '13px' }}
                          iconType="circle"
                        />
                        <Bar dataKey="count" fill="#10b981" name="월별 측정 수" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="cumulative" fill="#fbbf24" name="누적 측정 수" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">측정 데이터가 없습니다</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 취약점 분포 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
                <h3 className="text-base font-semibold mb-1 text-foreground">취약점 분포</h3>
                <p className="text-sm text-muted-foreground mb-6">검사 영역별 분포</p>
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
                          outerRadius={110}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '13px' }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">측정 데이터가 없습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 인사이트 카드 */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-foreground">인사이트</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {distributionData
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
                  .map((item, idx) => (
                    <div 
                      key={item.name} 
                      className="bg-white rounded-2xl p-6 shadow-sm border-2 hover:shadow-md transition-shadow"
                      style={{ borderColor: item.color }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-base text-foreground mb-1">
                            {item.name} 높은 그룹(20명)
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            기준: {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description} 영역에서 관심이 필요합니다
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/40">
                        <div className="flex items-center justify-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-md transition-all cursor-pointer group" 
                onClick={() => navigate('/assessment')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1.5 text-foreground">새로운 검사 시작</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI 기반 발달·심리 검사로 현재 상태를 확인하세요
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-md transition-all cursor-pointer group" 
                onClick={() => navigate('/concern-storage')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1.5 text-foreground">고민 저장소</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      저장된 고민과 AI 분석 결과를 확인하세요
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-md transition-all cursor-pointer group" 
                onClick={() => navigate('/experts')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1.5 text-foreground">전문가 상담</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      검사 결과를 바탕으로 전문가와 1:1 상담하세요
                    </p>
                  </div>
                </div>
              </div>
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

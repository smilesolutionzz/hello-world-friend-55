import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw,
  Brain,
  Eye,
  Download,
  Activity,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FamilyManagement from "@/components/family/FamilyManagement";
import AssessmentHistory from "@/components/history/AssessmentHistory";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, Legend, XAxis, YAxis, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile({ ...profileData, role: 'user' } as any);

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
      const monthKey = `${date.getMonth() + 1}월`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, count: 0, cumulative: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.count += 1;
    });

    let cumulative = 0;
    const months = ['8월', '9월', '10월', '11월', '12월', '1월'];
    return months.map(month => {
      const data = monthlyMap.get(month) || { month, count: 0, cumulative: 0 };
      cumulative += data.count;
      return { ...data, cumulative };
    });
  }, [filteredObservations]);

  // 영역별 분포 데이터
  const distributionData = React.useMemo(() => {
    if (filteredObservations.length === 0) {
      return [
        { name: '정서', value: 0, color: '#0ea5e9' },
        { name: '행동', value: 0, color: '#10b981' },
        { name: '인지', value: 0, color: '#f59e0b' },
        { name: '사회성', value: 0, color: '#8b5cf6' },
        { name: '신체', value: 0, color: '#ef4444' }
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
      { name: '정서', value: Math.round(totals.정서 / Math.max(counts.정서, 1)), color: '#0ea5e9' },
      { name: '행동', value: Math.round(totals.행동 / Math.max(counts.행동, 1)), color: '#10b981' },
      { name: '인지', value: Math.round(totals.인지 / Math.max(counts.인지, 1)), color: '#f59e0b' },
      { name: '사회성', value: Math.round(totals.사회성 / Math.max(counts.사회성, 1)), color: '#8b5cf6' },
      { name: '신체', value: Math.round(totals.신체 / Math.max(counts.신체, 1)), color: '#ef4444' }
    ];
  }, [filteredObservations]);

  const averageScore = filteredObservations.length > 0
    ? Math.round(filteredObservations.reduce((sum, obs) => sum + obs.score_overall, 0) / filteredObservations.length)
    : 0;

  const improvementRate = filteredObservations.length >= 2
    ? ((filteredObservations[0].score_overall - filteredObservations[filteredObservations.length - 1].score_overall) / 
       filteredObservations[filteredObservations.length - 1].score_overall * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                개인 대시보드
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {profile?.display_name}님의 검사 데이터
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={loadDashboardData} 
                variant="outline" 
                size="sm"
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="bg-transparent border-b border-slate-800 rounded-none h-auto p-0 w-full justify-start">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                개요
              </TabsTrigger>
              <TabsTrigger 
                value="assessments" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                검사 이력 ({filteredObservations.length})
              </TabsTrigger>
              <TabsTrigger 
                value="family" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                가족 관리
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="overview">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 총 검사 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    총 검사
                  </CardTitle>
                  <Users className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{filteredObservations.length}</div>
                  <p className="text-xs text-slate-500 mt-1">전체 누적 검사</p>
                </CardContent>
              </Card>

              {/* 이번 달 검사 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    이번 달
                  </CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{recent30DaysObservations}</div>
                  <p className="text-xs text-slate-500 mt-1">최근 30일 검사</p>
                </CardContent>
              </Card>

              {/* 평균 점수 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    평균 점수
                  </CardTitle>
                  <Activity className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{averageScore}점</div>
                  <p className="text-xs text-slate-500 mt-1">전체 평균</p>
                </CardContent>
              </Card>

              {/* 개선율 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    개선율
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{improvementRate.toFixed(1)}%</div>
                  <p className="text-xs text-slate-500 mt-1">최초 대비 개선</p>
                </CardContent>
              </Card>

              {/* 활동 점수 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    활동 점수
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">0.0</div>
                  <p className="text-xs text-slate-500 mt-1">종합 활동 지수</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 월별 검사 추이 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">월별 검사 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F1419', 
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Bar dataKey="count" fill="#fbbf24" name="월별 검사" />
                      <Bar dataKey="cumulative" fill="#f59e0b" name="누적 검사" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 영역별 점수 분포 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">영역별 점수 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}\n${value}점`}
                        outerRadius={100}
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
                          backgroundColor: '#0F1419', 
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Assessment Results Table */}
            <Card className="bg-[#0F1823] border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">최근 검사 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">검사일</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">연령대</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">종합 점수</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">상태</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredObservations.slice(0, 10).map((obs) => (
                        <tr key={obs.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-white">
                            {format(new Date(obs.created_at), 'yyyy. MM. dd', { locale: ko })}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-300">{obs.age_group}</td>
                          <td className="py-3 px-4 text-sm text-white">{obs.score_overall}점</td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={
                                obs.score_overall >= 80 
                                  ? 'bg-green-900/30 text-green-400 border-green-800' 
                                  : obs.score_overall >= 60
                                  ? 'bg-blue-900/30 text-blue-400 border-blue-800'
                                  : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                              }
                            >
                              {obs.score_overall >= 80 ? '우수' : obs.score_overall >= 60 ? '양호' : '관심필요'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/assessment/${obs.id}`)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast({ title: "다운로드 준비 중", description: "검사 결과를 다운로드합니다." })}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredObservations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            아직 검사 기록이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card 
                className="bg-[#0F1823] border-slate-800 cursor-pointer hover:bg-slate-900/50 transition-all"
                onClick={() => navigate('/assessment')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-white mb-1">새로운 검사</h3>
                      <p className="text-sm text-slate-400">AI 발달·심리 검사</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-[#0F1823] border-slate-800 cursor-pointer hover:bg-slate-900/50 transition-all"
                onClick={() => navigate('/iep-generator')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-white mb-1">맞춤형 IEP</h3>
                      <p className="text-sm text-slate-400">개별교육계획 생성</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-[#0F1823] border-slate-800 cursor-pointer hover:bg-slate-900/50 transition-all"
                onClick={() => navigate('/concern-storage')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-white mb-1">고민 저장소</h3>
                      <p className="text-sm text-slate-400">AI 분석 결과 확인</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-[#0F1823] border-slate-800 cursor-pointer hover:bg-slate-900/50 transition-all"
                onClick={() => navigate('/experts')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shrink-0">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-white mb-1">전문가 상담</h3>
                      <p className="text-sm text-slate-400">1:1 전문가 상담</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="mt-0">
            <AssessmentHistory />
          </TabsContent>

          {/* Family Tab */}
          <TabsContent value="family" className="mt-0">
            <FamilyManagement onUpdate={loadDashboardData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardNew;

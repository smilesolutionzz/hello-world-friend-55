import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Target,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FamilyManagement from "@/components/family/FamilyManagement";
import AssessmentHistory from "@/components/history/AssessmentHistory";
import ImprovementHistory from "@/components/improvement/ImprovementHistory";
import { SisterServicesCard } from "@/components/cross-promotion/SisterServicesCard";
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

interface PersonalityTrait {
  title: string;
  description: string;
  score: number;
}

interface PersonalityAnalysis {
  traits: PersonalityTrait[];
  summary: string;
}

const DashboardNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalityAnalysis, setPersonalityAnalysis] = useState<PersonalityAnalysis | null>(null);
  const [analyzingPersonality, setAnalyzingPersonality] = useState(false);
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
        let totalScore = 0;
        let categoryScores: { [key: string]: number } = {};
        
        // 실제 results 데이터 파싱
        if (assessment.results && typeof assessment.results === 'object') {
          // 점수 정보 파싱 시도
          if (assessment.results.scores && typeof assessment.results.scores === 'object') {
            // scores 객체에서 점수 추출
            if (assessment.results.scores.total !== undefined) {
              totalScore = Number(assessment.results.scores.total);
            } else if (assessment.results.scores.totalScore !== undefined) {
              totalScore = Number(assessment.results.scores.totalScore);
            }
            
            if (assessment.results.scores.categories) {
              categoryScores = { ...assessment.results.scores.categories };
            }
          } else if (assessment.results.total !== undefined) {
            totalScore = Number(assessment.results.total);
          } else if (assessment.results.totalScore !== undefined) {
            totalScore = Number(assessment.results.totalScore);
          }
          
          // 카테고리 점수 파싱
          if (assessment.results.categories && typeof assessment.results.categories === 'object') {
            categoryScores = { ...assessment.results.categories };
          } else if (assessment.results.categoryScores && typeof assessment.results.categoryScores === 'object') {
            categoryScores = { ...assessment.results.categoryScores };
          }
        }
        
        // 점수가 없는 경우 건너뛰지 않고 표시 (분석만 있는 경우도 있음)
        allObservations.push({
          id: assessment.id,
          user_id: user.id,
          age_group: assessment.age_group || '미분류',
          tags: ['검사', assessment.age_group || '미분류'],
          score_overall: totalScore,
          created_at: assessment.created_at,
          profile: { ...profileData, role: 'user' } as any,
          categoryScores: Object.keys(categoryScores).length > 0 ? categoryScores : undefined
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

  // 성격 분석 실행
  const analyzePersonality = async () => {
    const validObservations = observations.filter(obs => 
      obs.score_overall > 0 || (obs.categoryScores && Object.keys(obs.categoryScores).length > 0)
    );

    if (validObservations.length === 0) {
      toast({
        title: "분석 불가",
        description: "검사 데이터가 부족합니다. 2개 이상의 검사를 완료해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setAnalyzingPersonality(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-personality', {
        body: { observations: validObservations }
      });

      if (error) throw error;

      setPersonalityAnalysis(data);
      toast({
        title: "성격 분석 완료",
        description: "AI가 당신의 성격 특성을 분석했습니다.",
      });
    } catch (error: any) {
      console.error('Personality analysis error:', error);
      toast({
        title: "분석 실패",
        description: error.message || "성격 분석에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingPersonality(false);
    }
  };

  // 자동 분석 (데이터가 2개 이상일 때)
  useEffect(() => {
    const validObservations = observations.filter(obs => 
      obs.score_overall > 0 || (obs.categoryScores && Object.keys(obs.categoryScores).length > 0)
    );
    
    if (validObservations.length >= 2 && !personalityAnalysis && !analyzingPersonality) {
      analyzePersonality();
    }
  }, [observations.length]);

  const filteredObservations = observations.filter(obs => {
    const obsDate = new Date(obs.created_at);
    return obsDate >= dateRange.start && obsDate <= dateRange.end && obs.score_overall > 0;
  });

  const recent30DaysObservations = observations.filter(obs => {
    const obsDate = new Date(obs.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return obsDate >= thirtyDaysAgo;
  }).length;

  // 월별 검사 데이터 집계 - 최근 3개월 고정 표시 (9월, 10월, 11월)
  const monthlyData = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 11월 = 11
    
    // 최근 3개월 생성
    const last3Months = [];
    for (let i = 2; i >= 0; i--) {
      const monthNum = currentMonth - i;
      const year = monthNum > 0 ? currentYear : currentYear - 1;
      const adjustedMonth = monthNum > 0 ? monthNum : 12 + monthNum;
      last3Months.push({
        year,
        monthNum: adjustedMonth,
        monthKey: `${year}-${String(adjustedMonth).padStart(2, '0')}`,
        monthLabel: `${adjustedMonth}월`
      });
    }
    
    // 각 월별로 데이터 집계
    const monthlyMap = new Map<string, { month: string; count: number; sortKey: string }>();
    
    last3Months.forEach(m => {
      monthlyMap.set(m.monthKey, { 
        month: m.monthLabel, 
        count: 0, 
        sortKey: m.monthKey 
      });
    });
    
    filteredObservations.forEach(obs => {
      const date = new Date(obs.created_at);
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;
      const monthKey = `${year}-${String(monthNum).padStart(2, '0')}`;
      
      if (monthlyMap.has(monthKey)) {
        const monthData = monthlyMap.get(monthKey)!;
        monthData.count += 1;
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredObservations]);

  // 영역별 분포 데이터 - 실제 데이터만 사용
  const distributionData = React.useMemo(() => {
    if (filteredObservations.length === 0) {
      return [];
    }

    // 카테고리별 점수 수집
    const categoryMap = new Map<string, { total: number; count: number }>();

    filteredObservations.forEach(obs => {
      if (obs.categoryScores && typeof obs.categoryScores === 'object') {
        Object.entries(obs.categoryScores).forEach(([category, score]) => {
          if (typeof score === 'number' && score > 0) {
            if (!categoryMap.has(category)) {
              categoryMap.set(category, { total: 0, count: 0 });
            }
            const cat = categoryMap.get(category)!;
            cat.total += score;
            cat.count += 1;
          }
        });
      }
    });

    // 평균 계산 및 색상 할당
    const colors: { [key: string]: string } = {
      '정서': '#0ea5e9',
      '행동': '#10b981',
      '인지': '#f59e0b',
      '사회성': '#8b5cf6',
      '신체': '#ef4444',
      '언어': '#06b6d4',
      '감각': '#ec4899',
      '자조': '#84cc16'
    };

    const defaultColors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
    let colorIndex = 0;

    return Array.from(categoryMap.entries())
      .map(([name, { total, count }]) => ({
        name,
        value: Math.round(total / count),
        color: colors[name] || defaultColors[colorIndex++ % defaultColors.length]
      }))
      .filter(item => item.value > 0);
  }, [filteredObservations]);

  // 영역별 점수 타임라인 데이터 (최근 10개 검사)
  const categoryTimelineData = React.useMemo(() => {
    const recentTests = filteredObservations.slice(0, 10).reverse();
    
    return recentTests.map((obs, idx) => {
      const dataPoint: any = {
        name: `${idx + 1}회`,
        date: format(new Date(obs.created_at), 'MM/dd')
      };
      
      if (obs.categoryScores) {
        Object.entries(obs.categoryScores).forEach(([category, score]) => {
          if (typeof score === 'number' && score > 0) {
            dataPoint[category] = score;
          }
        });
      }
      
      // 점수가 없으면 종합 점수라도 표시
      if (Object.keys(dataPoint).length === 2 && obs.score_overall > 0) {
        dataPoint['종합'] = obs.score_overall;
      }
      
      return dataPoint;
    });
  }, [filteredObservations]);

  const averageScore = filteredObservations.length > 0
    ? Math.round(filteredObservations.reduce((sum, obs) => sum + obs.score_overall, 0) / filteredObservations.length)
    : 0;

  // 개선율: (최신 - 처음) / 처음 * 100
  // filteredObservations는 내림차순 정렬이므로 [0]이 최신, [length-1]이 처음
  const firstScore = filteredObservations.length >= 2 ? filteredObservations[filteredObservations.length - 1].score_overall : 0;
  const latestScore = filteredObservations.length >= 2 ? filteredObservations[0].score_overall : 0;
  const improvementRate = firstScore > 0
    ? ((latestScore - firstScore) / firstScore * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <UnifiedNavigation />
      {/* Header */}
        <Tabs defaultValue="overview">
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
          
            <TabsList className="bg-transparent border-b border-slate-800 rounded-none h-auto p-0 w-full justify-start">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                개요
              </TabsTrigger>
              <TabsTrigger 
                value="improvements" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                개선 이력
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
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
              {/* 월별 검사 추이 - 최근 3개월 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">월별 검사 추이 (최근 3개월)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#e2e8f0' }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#e2e8f0' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F1419', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ color: '#fff' }} />
                      <Bar dataKey="count" fill="#fbbf24" name="검사 횟수" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        AI 성격 분석
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-1">
                        검사 데이터로 분석한 당신의 성격 특성
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={analyzePersonality}
                      disabled={analyzingPersonality || observations.filter(obs => 
                        obs.score_overall > 0 || (obs.categoryScores && Object.keys(obs.categoryScores).length > 0)
                      ).length < 2}
                      className="border-slate-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {analyzingPersonality ? "분석 중..." : "재분석"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {analyzingPersonality ? (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-slate-300 mb-2">AI가 성격을 분석하는 중...</p>
                      <p className="text-sm text-slate-500">잠시만 기다려주세요</p>
                    </div>
                  ) : personalityAnalysis ? (
                    <div className="space-y-6">
                      {/* 요약 */}
                      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-lg p-4">
                        <p className="text-slate-200 leading-relaxed">{personalityAnalysis.summary}</p>
                      </div>

                      {/* 특성 카드들 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personalityAnalysis.traits.map((trait, index) => (
                          <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-white font-semibold">{trait.title}</h4>
                              <span className="text-sm text-purple-400 font-medium">{trait.score}%</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{trait.description}</p>
                            <Progress value={trait.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-2">검사 데이터가 부족합니다</p>
                      <p className="text-sm text-slate-500">2개 이상의 검사를 완료하면 성격 분석이 가능합니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 영역별 점수 타임라인 */}
            {categoryTimelineData.length > 0 && (
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">영역별 점수 추이 (최근 10회)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={categoryTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#e2e8f0' }}
                      />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#e2e8f0' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F1419', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ color: '#fff' }} />
                      {distributionData.map((category, idx) => (
                        <Line 
                          key={category.name}
                          type="monotone" 
                          dataKey={category.name} 
                          stroke={category.color}
                          strokeWidth={2}
                          dot={{ fill: category.color, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                      {/* 종합 점수 라인 (영역별 데이터가 없을 때) */}
                      {distributionData.length === 0 && (
                        <Line 
                          type="monotone" 
                          dataKey="종합" 
                          stroke="#fbbf24"
                          strokeWidth={2}
                          dot={{ fill: '#fbbf24', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Sister Services Card */}
            <div className="my-6">
              <SisterServicesCard />
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
                      {filteredObservations.slice(0, 10).map((obs) => {
                        const hasScore = obs.score_overall > 0;
                        const statusText = hasScore 
                          ? (obs.score_overall >= 80 ? '우수' : obs.score_overall >= 60 ? '양호' : '관심필요')
                          : '분석완료';
                        const statusColor = hasScore
                          ? (obs.score_overall >= 80 
                              ? 'bg-green-900/30 text-green-400 border-green-800'
                              : obs.score_overall >= 60
                              ? 'bg-blue-900/30 text-blue-400 border-blue-800'
                              : 'bg-yellow-900/30 text-yellow-400 border-yellow-800')
                          : 'bg-slate-900/30 text-slate-400 border-slate-800';
                        
                        return (
                          <tr key={obs.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                            <td className="py-3 px-4 text-sm text-white">
                              {format(new Date(obs.created_at), 'yyyy. MM. dd', { locale: ko })}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-300">{obs.age_group}</td>
                            <td className="py-3 px-4 text-sm text-white">
                              {hasScore ? `${obs.score_overall}점` : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={statusColor}>
                                {statusText}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    toast({ 
                                      title: "검사 결과 보기", 
                                      description: "검사 결과 상세 페이지로 이동합니다." 
                                    });
                                    navigate(`/assessment-detail/${obs.id}`);
                                  }}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    toast({ 
                                      title: "다운로드 준비 중", 
                                      description: "검사 결과를 PDF로 다운로드합니다." 
                                    });
                                  }}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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

          {/* Improvements Tab */}
          <TabsContent value="improvements" className="mt-0">
            <ImprovementHistory observations={filteredObservations} />
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="mt-0">
            <AssessmentHistory />
          </TabsContent>

          {/* Family Tab */}
          <TabsContent value="family" className="mt-0">
            <FamilyManagement onUpdate={loadDashboardData} />
          </TabsContent>
      </div>
        </Tabs>
    </div>
  );
};

export default DashboardNew;

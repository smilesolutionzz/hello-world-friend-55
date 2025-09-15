import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  Settings,
  LogOut,
  Heart,
  Clock,
  AlertTriangle,
  User,
  Baby,
  Users as ChildIcon,
  UserCheck,
  BarChart3,
  FileText,
  Star,
  CreditCard,
  Bell,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FamilyManagement from "@/components/family/FamilyManagement";

import AssessmentHistory from "@/components/history/AssessmentHistory";
import ConsultationHistory from "@/components/history/ConsultationHistory";
import TeamSettings from "@/components/team/TeamSettings";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { EnhancedChart } from "@/components/ui/enhanced-chart";
import { useToast } from "@/hooks/use-toast";
import TokenCTA from "@/components/TokenCTA";
import { OnboardingOverlay } from "@/components/ui/onboarding-overlay";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { ComprehensiveReportSection } from "@/components/ComprehensiveReportSection";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";
import { NextStepSuggestion } from "@/components/onboarding/NextStepSuggestion";
import TokenBalance from "@/components/TokenBalance";
import { SamplePDFDownload } from "@/components/SamplePDFDownload";
import LifespanDevelopmentalTracker from '@/components/development/LifespanDevelopmentalTracker';
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WeeklyInsights } from "@/components/dashboard/WeeklyInsights";
import LifeCareHub from "@/components/LifeCareHub";

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

interface UserStats {
  user_id: string;
  free_uses: number;
  subscription: 'free' | 'premium' | 'pro';
}

// Constants
const CHANGE_THRESHOLD = 0.5; // 50% change threshold

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    checkAuth();
    loadDashboardData();
    
    // Check if user has seen onboarding
    const hasSeenOnboardingStorage = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboardingStorage) {
      setShowOnboarding(true);
    }
    setHasSeenOnboarding(!!hasSeenOnboardingStorage);
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
      console.log('📊 Dashboard: Loading dashboard data...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Dashboard: No user found');
        return;
      }

      console.log('👤 Dashboard: User found:', user.id);

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('👤 Dashboard: Profile data:', profileData);
      setProfile({ ...profileData, role: 'user' } as any);

      if (!profileData) {
        console.log('❌ Dashboard: No profile data');
        setLoading(false);
        return;
      }


      // Load real assessment data
      console.log('📊 Dashboard: Loading assessments...');
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select(`
          *,
          profile:profiles(display_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Load timeline activities for more comprehensive data
      const { data: timelineData } = await supabase
        .from('timeline_activities')
        .select('*')
        .eq('member_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('📊 Dashboard: Assessment data loaded:', assessmentData?.length || 0);
      console.log('📊 Dashboard: Timeline data loaded:', timelineData?.length || 0);

      // Combine all data into observations format
      const allObservations: Observation[] = [];

      // Add assessments with real data
      assessmentData?.forEach((assessment: any) => {
        // Extract actual scores from assessment results
        let totalScore = 75; // default
        let categoryScores = { 정서: 75, 행동: 75, 인지: 75, 사회성: 75, 신체: 75 };
        
        if (assessment.results && typeof assessment.results === 'object') {
          // Handle different assessment result formats
          if (assessment.results.total) {
            totalScore = assessment.results.total;
          } else if (assessment.results.totalScore) {
            totalScore = assessment.results.totalScore;
          } else if (assessment.results.answers) {
            // Calculate score from answers array
            const answers = assessment.results.answers;
            if (Array.isArray(answers)) {
              totalScore = Math.round((answers.reduce((sum: number, ans: any) => {
                return sum + (typeof ans === 'number' ? ans : ans.score || 0);
              }, 0) / answers.length) * 20); // Scale to 0-100
            }
          }
          
          // Extract category scores if available
          if (assessment.results.categories) {
            Object.keys(categoryScores).forEach((cat, index) => {
              if (assessment.results.categories[cat]) {
                categoryScores[cat as keyof typeof categoryScores] = assessment.results.categories[cat];
              }
            });
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
          categoryScores // Add category scores for detailed analysis
        });
      });

      // Add timeline activities data
      timelineData?.forEach((activity: any) => {
        allObservations.push({
          id: activity.id,
          user_id: user.id,
          age_group: activity.meta?.ageGroup || 'adult',
          tags: activity.tags || [activity.type],
          score_overall: activity.score_overall || 75,
          created_at: activity.created_at,
          profile: { ...profileData, role: 'user' } as any,
          categoryScores: activity.meta?.categoryScores || { 정서: 75, 행동: 75, 인지: 75, 사회성: 75, 신체: 75 }
        });
      });


      // Sort by creation date
      allObservations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('📊 Dashboard: All observations processed:', allObservations.length);
      setObservations(allObservations);

      // Check for significant changes if we have data
      if (allObservations.length > 1) {
        const changeDetection = calculateWeeklyChange(allObservations);
        if (changeDetection.hasSignificantChange) {
          toast({
            title: "변화 감지",
            description: `최근 기간 동안 ${changeDetection.changeRate > 0 ? '상승' : '하락'} ${Math.abs(changeDetection.changeRate).toFixed(0)}% 변화가 감지되었습니다.`,
            duration: 5000,
          });
        }
      }

      // Load user stats
      const mockUserStats: UserStats = {
        user_id: user.id,
        free_uses: Math.max(0, 3 - allObservations.length), // 실제 사용량 반영
        subscription: allObservations.length > 5 ? 'premium' : 'free'
      };
      setUserStats(mockUserStats);

      console.log('✅ Dashboard: Data loading completed');

    } catch (error) {
      console.error('❌ Dashboard: Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeGroupIcon = (birthDate?: string) => {
    if (!birthDate) return <User className="w-4 h-4" />;
    
    const age = getAgeFromBirthDate(birthDate);
    if (age < 3) return <Baby className="w-4 h-4" />;
    if (age < 18) return <ChildIcon className="w-4 h-4" />;
    return <UserCheck className="w-4 h-4" />;
  };

  const getAgeGroupLabel = (birthDate?: string) => {
    if (!birthDate) return "연령 미입력";
    
    const age = getAgeFromBirthDate(birthDate);
    if (age < 3) return `유아 (${age}세)`;
    if (age < 18) return `아동/청소년 (${age}세)`;
    return `성인 (${age}세)`;
  };

  // Calculate KPI data
  const totalObservations = observations.length;
  const recent30DaysObservations = observations.filter(obs => {
    const obsDate = new Date(obs.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return obsDate >= thirtyDaysAgo;
  }).length;

  // Calculate real distribution data based on assessments
  const distributionData = React.useMemo(() => {
    console.log('🔄 Calculating distribution data, observations count:', observations.length);
    
    if (observations.length === 0) {
      return [
        { name: '정서', value: 0, color: '#0ea5e9', description: '감정 조절 및 표현 능력' },
        { name: '행동', value: 0, color: '#10b981', description: '적응적 행동 패턴' },
        { name: '인지', value: 0, color: '#f59e0b', description: '사고력 및 학습 능력' },
        { name: '사회성', value: 0, color: '#8b5cf6', description: '대인관계 및 소통 능력' },
        { name: '신체', value: 0, color: '#ef4444', description: '신체 발달 및 건강 상태' }
      ];
    }

    // Calculate averages from actual assessment data
    const totals = { 정서: 0, 행동: 0, 인지: 0, 사회성: 0, 신체: 0 };
    const counts = { 정서: 0, 행동: 0, 인지: 0, 사회성: 0, 신체: 0 };

    observations.forEach(obs => {
      // Use actual category scores if available, otherwise derive from overall score
      if ((obs as any).categoryScores) {
        Object.keys(totals).forEach(category => {
          const score = (obs as any).categoryScores[category] || obs.score_overall;
          totals[category as keyof typeof totals] += score;
          counts[category as keyof typeof counts] += 1;
        });
      } else {
        // Derive category scores from overall score with some variance
        const baseScore = obs.score_overall || 75;
        // 고정된 값을 사용하여 무한 재계산 방지
        const variances = [5, -3, 8, -2, 1]; // 고정된 분산값
        Object.keys(totals).forEach((category, index) => {
          const variance = variances[index] || 0;
          totals[category as keyof typeof totals] += Math.max(0, Math.min(100, baseScore + variance));
          counts[category as keyof typeof counts] += 1;
        });
      }
    });

    const result = [
      { name: '정서', value: Math.round(totals.정서 / Math.max(counts.정서, 1)), color: '#0ea5e9', description: '감정 조절 및 표현 능력' },
      { name: '행동', value: Math.round(totals.행동 / Math.max(counts.행동, 1)), color: '#10b981', description: '적응적 행동 패턴' },
      { name: '인지', value: Math.round(totals.인지 / Math.max(counts.인지, 1)), color: '#f59e0b', description: '사고력 및 학습 능력' },
      { name: '사회성', value: Math.round(totals.사회성 / Math.max(counts.사회성, 1)), color: '#8b5cf6', description: '대인관계 및 소통 능력' },
      { name: '신체', value: Math.round(totals.신체 / Math.max(counts.신체, 1)), color: '#ef4444', description: '신체 발달 및 건강 상태' }
    ];
    
    console.log('✅ Distribution data calculated:', result);
    return result;
  }, [observations.length]); // observations 배열 대신 length만 의존성으로 사용

  // Calculate trend data from actual observations (last 12 data points)
  const trendData = React.useMemo(() => {
    if (observations.length === 0) {
      return Array.from({ length: 12 }, (_, i) => ({
        week: `${12 - i}주 전`,
        score: 0
      }));
    }

    // Sort observations by date and take recent ones
    const sortedObs = [...observations]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-12); // Last 12 observations

    return sortedObs.map((obs, index) => ({
      week: `${index + 1}번째`,
      score: obs.score_overall || 0,
      date: new Date(obs.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }));
  }, [observations]);

  const getSubscriptionStatus = () => {
    if (!userStats) return { label: '로딩중', color: 'bg-gray-100 text-gray-600' };
    
    switch (userStats.subscription) {
      case 'premium':
        return { label: '프리미엄', color: 'bg-blue-100 text-blue-600' };
      case 'pro':
        return { label: '프로', color: 'bg-purple-100 text-purple-600' };
      default:
        return { label: '무료', color: 'bg-gray-100 text-gray-600' };
    }
  };

  // Calculate weekly change rate
  const calculateWeeklyChange = (observations: Observation[]) => {
    const sortedObs = observations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (sortedObs.length < 2) {
      return { hasSignificantChange: false, changeRate: 0, recentWeekScore: 0, previousWeekScore: 0 };
    }

    const recentWeekScore = sortedObs[0].score_overall;
    const previousWeekScore = sortedObs[1].score_overall;
    
    if (previousWeekScore === 0) {
      return { hasSignificantChange: false, changeRate: 0, recentWeekScore, previousWeekScore };
    }

    const changeRate = ((recentWeekScore - previousWeekScore) / previousWeekScore) * 100;
    const hasSignificantChange = Math.abs(changeRate) >= (CHANGE_THRESHOLD * 100);

    return { hasSignificantChange, changeRate, recentWeekScore, previousWeekScore };
  };

  const weeklyChange = calculateWeeklyChange(observations);

  const sendEmailNotification = () => {
    toast({
      title: "이메일 알림 설정",
      description: "이메일 알림이 설정되었습니다.",
      duration: 3000,
    });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
    toast({
      title: "환영합니다! 🎉",
      description: "AI 하이라이트프로와 함께 가족의 심리 건강을 관리해보세요.",
      duration: 5000,
    });
  };

  // Loading state removed as requested by user

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      <OnboardingGuide onComplete={() => setOnboardingCompleted(true)} />
      
      {/* Unified Navigation */}
      <UnifiedNavigation />
      
      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Header - Simplified for mobile */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 lg:block hidden">
        <div className="container mx-auto px-6 py-4">
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

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-3 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-8 sm:h-10">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-1">개요</TabsTrigger>
            <TabsTrigger value="family" className="text-xs sm:text-sm px-1">가족</TabsTrigger>
            <TabsTrigger value="assessments" className="text-xs sm:text-sm px-1">검사</TabsTrigger>
            <TabsTrigger value="consultations" className="text-xs sm:text-sm px-1">상담</TabsTrigger>
            <TabsTrigger value="lifecare" className="text-xs sm:text-sm px-1">라이프케어</TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm px-1">팀</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 sm:space-y-6">
            {/* KPI Cards - Mobile Optimized Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{totalObservations}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">총 관찰수</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{recent30DaysObservations}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">30일 관찰</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {userStats ? `${3 - userStats.free_uses}/3` : '로딩중'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">무료 잔여</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionStatus().color}`}>
                      {getSubscriptionStatus().label}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">구독 상태</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Change Detection Alert */}
            {weeklyChange.hasSignificantChange && (
              <Card className="p-6 border-orange-200 bg-orange-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center relative">
                      <Bell className="w-6 h-6 text-orange-600" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">🔔</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-orange-800">변화 감지</h3>
                        {weeklyChange.changeRate > 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-orange-700 mb-2">
                        최근 2주 변화율 {weeklyChange.changeRate > 0 ? '+' : ''}{weeklyChange.changeRate.toFixed(0)}% 
                        {weeklyChange.changeRate > 0 ? ' ↑' : ' ↓'}
                      </p>
                      <p className="text-xs text-orange-600">
                        {weeklyChange.previousWeekScore}점 → {weeklyChange.recentWeekScore}점
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={showChangeModal} onOpenChange={setShowChangeModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          자세히 보기
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>변화 상세 내역</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">최근 관찰 기록</h4>
                            <div className="space-y-2">
                              {observations.slice(0, 3).map((obs, index) => (
                                <div key={obs.id} className="flex justify-between items-center text-sm">
                                  <span>{new Date(obs.created_at).toLocaleDateString('ko-KR')}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{obs.score_overall}점</span>
                                    <Badge variant="outline" className="text-xs">
                                      {obs.tags.join(', ')}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>변화율:</span>
                            <span className={`font-medium ${weeklyChange.changeRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {weeklyChange.changeRate > 0 ? '+' : ''}{weeklyChange.changeRate.toFixed(1)}%
                            </span>
                          </div>
                          {userStats?.subscription !== 'free' && (
                            <Button 
                              onClick={sendEmailNotification}
                              className="w-full"
                              variant="outline"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              이메일 알림 설정
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            )}

            {/* Token Balance and Comprehensive Report Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="space-y-6">
                <TokenBalance compact={false} showPurchaseButton={true} />
                <SamplePDFDownload />
              </div>
              <div className="lg:col-span-2">
                <ComprehensiveReportSection
                  totalAssessments={observations.filter(obs => obs.tags.includes('검사')).length}
                  totalObservations={observations.filter(obs => obs.tags.includes('관찰일지')).length}
                  totalConsultations={observations.filter(obs => obs.tags.includes('상담')).length}
                  hasEnoughData={observations.length >= 3}
                />
              </div>
            </div>

            {/* Charts Section */}
        <div className="space-y-6">
          <NextStepSuggestion />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">영역별 분포</h3>
                {distributionData.some(item => item.value > 0) ? (
                  <div className="h-64">
                    <ChartContainer config={{}} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {distributionData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-muted-foreground">{item.name} ({item.value}점)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>첫 번째 검사를 완료하면 영역별 분포를 확인할 수 있습니다</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/assessment')}
                      >
                        검사 시작하기
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Trend Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">최근 12주 점수 추이</h3>
                {trendData.some(item => item.score > 0) ? (
                  <div className="h-64">
                    <ChartContainer config={{}} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <XAxis 
                            dataKey="week" 
                            className="text-xs"
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            className="text-xs"
                            tick={{ fontSize: 10 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#0ea5e9" 
                            strokeWidth={2}
                            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>여러 번의 검사를 완료하면 점수 추이를 확인할 수 있습니다</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/assessment')}
                      >
                        검사 시작하기
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

            {/* Subjects Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">대상자 현황</h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/observation')}>
                  <Plus className="w-4 h-4 mr-2" />
                  새 관찰 추가
                </Button>
              </div>
              
              {observations.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>연령대</TableHead>
                        <TableHead>최근 점수</TableHead>
                        <TableHead>최근 업로드</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {observations.map((obs) => (
                        <TableRow key={obs.id}>
                          <TableCell className="font-medium">
                            {obs.profile?.display_name || '알 수 없음'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{obs.age_group}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{obs.score_overall}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(obs.score_overall / 20)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(obs.created_at).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={userStats?.subscription === 'free' ? 'secondary' : 'default'}
                            >
                              {userStats?.subscription === 'free' ? '무료' : '구독'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium mb-2">관찰 데이터가 없습니다</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    첫 번째 관찰을 시작하여 데이터를 수집해보세요
                  </p>
                  <Button onClick={() => navigate('/observation')}>
                    <Plus className="w-4 h-4 mr-2" />
                    관찰 시작하기
                  </Button>
                </div>
              )}
            </Card>

            {/* New Dashboard Components Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Recent Activity */}
              <RecentActivity 
                activities={observations.slice(0, 5).map(obs => ({
                  id: obs.id,
                  type: obs.tags.includes('검사') ? 'assessment' : obs.tags.includes('상담') ? 'consultation' : 'observation',
                  title: `${obs.profile?.display_name || '알 수 없음'} - ${obs.tags.join(', ')}`,
                  date: obs.created_at,
                  score: obs.score_overall
                }))}
              />
              
              {/* Quick Actions */}
              <QuickActions />
              
              {/* Weekly Insights */}
              <WeeklyInsights
                totalActivities={recent30DaysObservations}
                averageScore={Math.round(observations.reduce((sum, obs) => sum + obs.score_overall, 0) / Math.max(observations.length, 1))}
                trendDirection={weeklyChange.changeRate > 5 ? 'up' : weeklyChange.changeRate < -5 ? 'down' : 'stable'}
                weeklyGoal={5}
              />
              
              {/* Lifespan Developmental Tracking */}
              <div className="lg:col-span-3">
                <LifespanDevelopmentalTracker 
                  birthDate={profile?.birth_date}
                />
              </div>
            </div>

            {/* User Info Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">사용자 정보</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/observation')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  관찰 추가
                </Button>
              </div>
              
              <Card className="p-8 text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">개인 데이터 관리</h3>
                <p className="text-muted-foreground mb-4">
                  검사 결과와 관찰일지를 통합 관리하세요
                </p>
                <Button onClick={() => navigate('/observation')}>
                  <Plus className="w-4 h-4 mr-2" />
                  새 데이터 추가
                </Button>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              <Card className="p-6 hover-glow cursor-pointer" onClick={() => navigate('/assessment')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">3분 심리검사</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      연령별 맞춤 진단으로 정확한 상태를 파악하세요
                    </p>
                    <Badge className="bg-primary/20 text-primary">지금 시작</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover-glow cursor-pointer" onClick={() => navigate('/ai-counselor')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">24시간 AI 상담</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      언제든지 마음 편히 상담받으세요
                    </p>
                    <Badge className="bg-green-100 text-green-700">즉시 이용</Badge>
                  </div>
                </div>
              </Card>

              {/* Subscription CTA Panel */}
              <div className="lg:col-span-1 md:col-span-2">
                <TokenCTA context="dashboard" />
              </div>
            </div>
          </TabsContent>


          <TabsContent value="family">
            <FamilyManagement onUpdate={loadDashboardData} />
          </TabsContent>


          <TabsContent value="assessments">
            <AssessmentHistory />
          </TabsContent>

          <TabsContent value="consultations">
            <ConsultationHistory />
          </TabsContent>

          <TabsContent value="lifecare">
            <LifeCareHub />
          </TabsContent>

          <TabsContent value="team">
            <TeamSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
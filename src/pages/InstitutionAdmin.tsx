import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  FileText,
  ClipboardList, 
  TrendingUp,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Building,
  Settings,
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MemberManagement from '@/components/institution/MemberManagement';
import MemberDetailView from '@/components/institution/MemberDetailView';
import ComprehensiveReport from '@/components/institution/ComprehensiveReport';
import { TherapyScheduler } from '@/components/therapy/TherapyScheduler';

interface InstitutionStats {
  total_members: number;
  active_members: number;
  total_tests: number;
  total_observations: number;
  this_month_tests: number;
  this_month_observations: number;
  avg_score: number;
  improvement_rate: number;
}

interface Institution {
  id: string;
  admin_id: string;
  institution_name: string;
  institution_type: string;
  address?: string;
  phone?: string;
  email?: string;
  director_name?: string;
  description?: string;
}

export default function InstitutionAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is institution admin
  const [isInstitutionAdmin, setIsInstitutionAdmin] = useState(false);
  const [institutionInfo, setInstitutionInfo] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Data states
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Institution settings form
  const [institutionForm, setInstitutionForm] = useState({
    institution_name: '',
    institution_type: '',
    address: '',
    phone: '',
    email: '',
    director_name: '',
    description: ''
  });

  useEffect(() => {
    checkInstitutionAccess();
  }, []);

  const checkInstitutionAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user is associated with an institution
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Check if user has institution tier or admin role
      const isInstitution = profile?.subscription_tier === 'institution';

      if (!isInstitution) {
        toast({
          title: "접근 권한 없음",
          description: "제휴기관 관리자만 접근할 수 있습니다.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsInstitutionAdmin(true);

      // Fetch or create institution info
      await fetchInstitutionInfo(user.id);
      await loadInstitutionData(user.id);

    } catch (error) {
      console.error('Institution access check failed:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutionInfo = async (adminId: string) => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('admin_id', adminId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setInstitutionInfo(data);
        setInstitutionForm({
          institution_name: data.institution_name || '',
          institution_type: data.institution_type || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          director_name: data.director_name || '',
          description: data.description || ''
        });
      } else {
        // Create default institution info
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', adminId)
          .single();

        const defaultInstitution = {
          admin_id: adminId,
          institution_name: profile?.display_name || '신규 기관',
          institution_type: 'clinic'
        };

        const { data: newInstitution, error: createError } = await supabase
          .from('institutions')
          .insert(defaultInstitution)
          .select()
          .single();

        if (createError) throw createError;

        setInstitutionInfo(newInstitution);
        setInstitutionForm({
          institution_name: newInstitution.institution_name,
          institution_type: newInstitution.institution_type,
          address: '',
          phone: '',
          email: '',
          director_name: '',
          description: ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching institution info:', error);
    }
  };

  const loadInstitutionData = async (adminId: string) => {
    await fetchInstitutionStats(adminId);
  };

  const fetchInstitutionStats = async (adminId: string) => {
    try {
      // 기관 회원 조회
      const { data: members, count: totalMembers } = await supabase
        .from('institution_members')
        .select('*', { count: 'exact' })
        .eq('institution_admin_id', adminId);

      const activeMembers = members?.filter(m => m.status === 'active').length || 0;

      let totalTests = 0;
      let totalObservations = 0;
      let thisMonthTests = 0;
      let thisMonthObservations = 0;
      let totalScores = 0;
      let scoreCount = 0;
      let totalImprovementRate = 0;
      let improvementCount = 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      if (members) {
        for (const member of members) {
          if (!member.member_user_id) continue;

          // 테스트 조회
          const { count: memberTests } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.member_user_id);

          const { count: memberThisMonthTests } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.member_user_id)
            .gte('completed_at', startOfMonth.toISOString());

          // 관찰일지 조회
          const { count: memberObservations } = await supabase
            .from('observation_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.member_user_id);

          const { count: memberThisMonthObservations } = await supabase
            .from('observation_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.member_user_id)
            .gte('created_at', startOfMonth.toISOString());

          totalTests += memberTests || 0;
          totalObservations += memberObservations || 0;
          thisMonthTests += memberThisMonthTests || 0;
          thisMonthObservations += memberThisMonthObservations || 0;

          // 점수 및 개선율 계산 (최근 검사들)
          const { data: recentTests } = await supabase
            .from('test_results')
            .select('scores, completed_at')
            .eq('user_id', member.member_user_id)
            .order('completed_at', { ascending: false })
            .limit(10);

          if (recentTests && recentTests.length > 0) {
            const scores = recentTests.map(t => (t.scores as any)?.total_score || 0).filter(s => s > 0);
            if (scores.length > 0) {
              totalScores += scores.reduce((a, b) => a + b, 0) / scores.length;
              scoreCount++;
            }

            // 개선율 계산
            if (recentTests.length >= 2) {
              const sortedTests = recentTests.sort((a, b) => 
                new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
              );
              const firstScore = (sortedTests[0].scores as any)?.total_score || 0;
              const lastScore = (sortedTests[sortedTests.length - 1].scores as any)?.total_score || 0;
              
              if (firstScore > 0) {
                const improvementRate = ((lastScore - firstScore) / firstScore) * 100;
                totalImprovementRate += improvementRate;
                improvementCount++;
              }
            }
          }
        }
      }

      setStats({
        total_members: totalMembers || 0,
        active_members: activeMembers,
        total_tests: totalTests,
        total_observations: totalObservations,
        this_month_tests: thisMonthTests,
        this_month_observations: thisMonthObservations,
        avg_score: scoreCount > 0 ? totalScores / scoreCount : 0,
        improvement_rate: improvementCount > 0 ? totalImprovementRate / improvementCount : 0
      });

    } catch (error: any) {
      console.error('Error fetching institution stats:', error);
    }
  };

  const updateInstitutionInfo = async () => {
    if (!institutionInfo) return;

    try {
      const { error } = await supabase
        .from('institutions')
        .update({
          institution_name: institutionForm.institution_name,
          institution_type: institutionForm.institution_type,
          address: institutionForm.address || null,
          phone: institutionForm.phone || null,
          email: institutionForm.email || null,
          director_name: institutionForm.director_name || null,
          description: institutionForm.description || null
        })
        .eq('id', institutionInfo.id);

      if (error) throw error;

      toast({
        title: "기관 정보 수정 완료",
        description: "기관 정보가 성공적으로 수정되었습니다.",
      });

      setShowSettings(false);
      await fetchInstitutionInfo(institutionInfo.admin_id);

    } catch (error: any) {
      console.error('Error updating institution:', error);
      toast({
        title: "기관 정보 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!isInstitutionAdmin) {
    return null;
  }

  // Member detail view
  if (selectedMemberId) {
    return (
      <div className="min-h-screen bg-background p-6">
        <MemberDetailView 
          memberId={selectedMemberId} 
          onClose={() => setSelectedMemberId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                홈으로
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    {institutionInfo?.institution_name || '제휴기관 관리자'}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  회원 관리 및 종합 분석 대시보드
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => loadInstitutionData(institutionInfo?.admin_id || '')} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    기관 설정
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>기관 정보 설정</DialogTitle>
                    <DialogDescription>
                      기관의 기본 정보를 수정하세요
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="institution_name">기관명 *</Label>
                        <Input
                          id="institution_name"
                          value={institutionForm.institution_name}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            institution_name: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="institution_type">기관 유형</Label>
                        <Input
                          id="institution_type"
                          value={institutionForm.institution_type}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            institution_type: e.target.value
                          })}
                          placeholder="예: 학교, 상담센터, 치료실"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">주소</Label>
                      <Input
                        id="address"
                        value={institutionForm.address}
                        onChange={(e) => setInstitutionForm({
                          ...institutionForm,
                          address: e.target.value
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">전화번호</Label>
                        <Input
                          id="phone"
                          value={institutionForm.phone}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            phone: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          value={institutionForm.email}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            email: e.target.value
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="director_name">기관장/담당자명</Label>
                      <Input
                        id="director_name"
                        value={institutionForm.director_name}
                        onChange={(e) => setInstitutionForm({
                          ...institutionForm,
                          director_name: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">기관 소개</Label>
                      <Textarea
                        id="description"
                        value={institutionForm.description}
                        onChange={(e) => setInstitutionForm({
                          ...institutionForm,
                          description: e.target.value
                        })}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowSettings(false)}>
                        취소
                      </Button>
                      <Button onClick={updateInstitutionInfo}>
                        저장
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 회원수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_members || 0}</div>
              <p className="text-xs text-muted-foreground">
                활성 회원 {stats?.active_members || 0}명
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 검사</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_tests || 0}</div>
              <p className="text-xs text-muted-foreground">
                이번 달 {stats?.this_month_tests || 0}건
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avg_score.toFixed(1) || '0.0'}</div>
              <p className="text-xs text-muted-foreground">
                전체 평균
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">개선율</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.improvement_rate ? stats.improvement_rate.toFixed(1) : '0.0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                평균 개선도
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schedule">일정관리</TabsTrigger>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="members">회원 관리</TabsTrigger>
            <TabsTrigger value="reports">종합 리포트</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            {institutionInfo && <TherapyScheduler institutionId={institutionInfo.id} />}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기관 현황 요약</CardTitle>
                <CardDescription>
                  최근 활동 및 주요 지표
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">이번 달 활동</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">신규 검사</span>
                        <span className="text-sm font-medium">{stats?.this_month_tests || 0}건</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">신규 관찰일지</span>
                        <span className="text-sm font-medium">{stats?.this_month_observations || 0}건</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">운영 현황</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">활성 회원률</span>
                        <span className="text-sm font-medium">
                          {stats?.total_members ? 
                            ((stats.active_members / stats.total_members) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">평균 검사 횟수</span>
                        <span className="text-sm font-medium">
                          {stats?.total_members ? 
                            (stats.total_tests / stats.total_members).toFixed(1) : 0}회
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">성과 지표</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">평균 점수</span>
                        <Badge variant={stats?.avg_score && stats.avg_score > 70 ? "default" : "secondary"}>
                          {stats?.avg_score.toFixed(1) || '0.0'}점
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">개선율</span>
                        <Badge variant={stats?.improvement_rate && stats.improvement_rate > 0 ? "default" : "secondary"}>
                          {stats?.improvement_rate ? stats.improvement_rate.toFixed(1) : '0.0'}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MemberManagement adminId={institutionInfo?.admin_id || ''} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ComprehensiveReport 
              adminId={institutionInfo?.admin_id || ''} 
              institutionInfo={institutionInfo}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>상세 분석</CardTitle>
                <CardDescription>
                  고급 분석 기능은 곧 추가될 예정입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">고급 분석 기능</h3>
                  <p className="text-muted-foreground mb-4">
                    회원별 상세 분석, 예측 모델, 비교 분석 등의<br />
                    고급 기능이 준비 중입니다.
                  </p>
                  <Button variant="outline" disabled>
                    준비 중
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
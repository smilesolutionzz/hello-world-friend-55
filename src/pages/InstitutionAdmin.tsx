import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCircle,
  UserCheck,
  Bot,
  MessageSquare,
  Eye,
  Download,
  DollarSign,
  Activity,
  Target,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MemberManagement from '@/components/institution/MemberManagement';
import MemberDetailView from '@/components/institution/MemberDetailView';
import ComprehensiveReport from '@/components/institution/ComprehensiveReport';
import { TherapyScheduler } from '@/components/therapy/TherapyScheduler';
import TherapistManagement from '@/components/institution/TherapistManagement';
import ConsultationRequestManager from '@/components/institution/ConsultationRequestManager';
import { AutomatedInstitutionDashboard } from '@/components/institution/AutomatedInstitutionDashboard';
import VoucherReportGenerator from '@/components/institution/VoucherReportGenerator';
import { OrganizationChart } from '@/components/organization/OrganizationChart';
import { TestInsights } from '@/components/organization/TestInsights';
import { SocialContentGenerator } from '@/components/institution/SocialContentGenerator';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface InstitutionStats {
  total_members: number;
  active_members: number;
  total_tests: number;
  total_observations: number;
  this_month_tests: number;
  this_month_observations: number;
  avg_score: number;
  improvement_rate: number;
  total_payments: number;
  this_month_payments: number;
  conversion_rate: number;
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

interface MemberTest {
  id: string;
  member_name: string;
  test_name: string;
  test_type: string;
  completed_at: string;
  score: number;
  status: 'completed' | 'in_progress';
}

export default function InstitutionAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isInstitutionAdmin, setIsInstitutionAdmin] = useState(false);
  const [institutionInfo, setInstitutionInfo] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [memberTests, setMemberTests] = useState<MemberTest[]>([]);

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

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
    await fetchMemberTests(adminId);
  };

  const fetchMemberTests = async (adminId: string) => {
    try {
      const { data: members } = await supabase
        .from('institution_members')
        .select('member_user_id, member_name')
        .eq('institution_admin_id', adminId)
        .eq('status', 'active');

      if (!members || members.length === 0) return;

      const allTests: MemberTest[] = [];

      for (const member of members) {
        if (!member.member_user_id) continue;

        const { data: tests } = await supabase
          .from('test_results')
          .select('id, test_type_id, scores, completed_at')
          .eq('user_id', member.member_user_id)
          .order('completed_at', { ascending: false })
          .limit(10);

        if (tests) {
          tests.forEach(test => {
            allTests.push({
              id: test.id,
              member_name: member.member_name || '이름 없음',
              test_name: '발달검사',
              test_type: test.test_type_id,
              completed_at: test.completed_at,
              score: (test.scores as any)?.total_score || 0,
              status: 'completed'
            });
          });
        }
      }

      setMemberTests(allTests.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      ));

    } catch (error) {
      console.error('Error fetching member tests:', error);
    }
  };

  const getTestName = (testType: string): string => {
    const names: { [key: string]: string } = {
      'kprc': 'KPRC 발달검사',
      'denver': 'Denver 발달검사',
      'bayley': 'Bayley 발달검사',
      'mmse': 'MMSE 인지검사',
      'depression': '우울증 검사',
      'anxiety': '불안장애 검사',
      'adhd': 'ADHD 검사',
      'autism': '자폐스펙트럼 검사'
    };
    return names[testType] || testType;
  };

  const fetchInstitutionStats = async (adminId: string) => {
    try {
      const { data: members, count: totalMembers } = await supabase
        .from('institution_members')
        .select('*', { count: 'exact' })
        .eq('institution_admin_id', adminId);

      const activeMembers = members?.filter(m => m.status === 'active').length || 0;

      let totalTests = 0;
      let totalObservations = 0;
      let thisMonthTests = 0;
      let thisMonthObservations = 0;
      let totalPayments = 0;
      let thisMonthPayments = 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      if (members) {
        for (const member of members) {
          if (!member.member_user_id) continue;

          const { count: memberTests } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.member_user_id);

          const { count: memberThisMonthTests } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.member_user_id)
            .gte('completed_at', startOfMonth.toISOString());

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

          // 임시 결제 데이터 (실제로는 결제 테이블에서 가져와야 함)
          totalPayments += Math.floor(Math.random() * 100000);
          thisMonthPayments += Math.floor(Math.random() * 50000);
        }
      }

      const conversionRate = totalMembers ? (activeMembers / totalMembers) * 100 : 0;

      setStats({
        total_members: totalMembers || 0,
        active_members: activeMembers,
        total_tests: totalTests,
        total_observations: totalObservations,
        this_month_tests: thisMonthTests,
        this_month_observations: thisMonthObservations,
        avg_score: 0,
        improvement_rate: 0,
        total_payments: totalPayments,
        this_month_payments: thisMonthPayments,
        conversion_rate: conversionRate
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

  const handleViewTestResult = (testId: string) => {
    setSelectedTestId(testId);
    // 여기에 검사 결과 모달을 띄우는 로직 추가
    toast({
      title: "검사 결과 조회",
      description: "검사 결과를 조회합니다.",
    });
  };

  const handleDownloadTestResult = async (testId: string) => {
    try {
      toast({
        title: "다운로드 시작",
        description: "검사 결과를 다운로드하고 있습니다.",
      });
      
      // 여기에 실제 다운로드 로직 추가
      
      toast({
        title: "다운로드 완료",
        description: "검사 결과가 다운로드되었습니다.",
      });
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "검사 결과 다운로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64 bg-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isInstitutionAdmin) {
    return null;
  }

  if (selectedMemberId) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] p-6">
        <MemberDetailView 
          memberId={selectedMemberId} 
          onClose={() => setSelectedMemberId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                기관 대시보드
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {institutionInfo?.institution_name || '제휴기관'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => loadInstitutionData(institutionInfo?.admin_id || '')} 
                variant="outline" 
                size="sm"
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    설정
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-[#0F1419] border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">기관 정보 설정</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      기관의 기본 정보를 수정하세요
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="institution_name" className="text-slate-300">기관명 *</Label>
                        <Input
                          id="institution_name"
                          value={institutionForm.institution_name}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            institution_name: e.target.value
                          })}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="institution_type" className="text-slate-300">기관 유형</Label>
                        <Input
                          id="institution_type"
                          value={institutionForm.institution_type}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            institution_type: e.target.value
                          })}
                          placeholder="예: 학교, 상담센터, 치료실"
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="director_name" className="text-slate-300">원장명</Label>
                      <Input
                        id="director_name"
                        value={institutionForm.director_name}
                        onChange={(e) => setInstitutionForm({
                          ...institutionForm,
                          director_name: e.target.value
                        })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-slate-300">주소</Label>
                      <Input
                        id="address"
                        value={institutionForm.address}
                        onChange={(e) => setInstitutionForm({
                          ...institutionForm,
                          address: e.target.value
                        })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-slate-300">전화번호</Label>
                        <Input
                          id="phone"
                          value={institutionForm.phone}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            phone: e.target.value
                          })}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-300">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          value={institutionForm.email}
                          onChange={(e) => setInstitutionForm({
                            ...institutionForm,
                            email: e.target.value
                          })}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-slate-300">기관 소개</Label>
                      <Textarea
                        id="description"
                        value={institutionForm.description}
                        onChange={(e) => setInstitutionForm({
                          ...institutionForm,
                          description: e.target.value
                        })}
                        rows={4}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSettings(false)}
                        className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        취소
                      </Button>
                      <Button 
                        onClick={updateInstitutionInfo}
                        className="bg-primary text-white"
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="bg-transparent border-b border-slate-800 rounded-none h-auto p-0 w-full justify-start">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                개요
              </TabsTrigger>
              <TabsTrigger 
                value="members" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                회원 관리 ({stats?.total_members || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="tests" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                검사 ({stats?.total_tests || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                결제 ({stats?.this_month_payments || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="marketing" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                <Bot className="h-4 w-4 mr-2" />
                마케팅 AI
              </TabsTrigger>
              <TabsTrigger 
                value="voucher" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-slate-400 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                바우처 일지
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 신청 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    총 신청
                  </CardTitle>
                  <Users className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.total_members || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">전체 등록 회원</p>
                </CardContent>
              </Card>

              {/* 전환율 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    전환율
                  </CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats?.conversion_rate.toFixed(1) || 0}%</div>
                  <p className="text-xs text-slate-500 mt-1">활성 회원 비율</p>
                </CardContent>
              </Card>

              {/* 매출 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    매출
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{(stats?.this_month_payments || 0).toLocaleString()}원</div>
                  <p className="text-xs text-slate-500 mt-1">이번 달 비대면 결제</p>
                </CardContent>
              </Card>

              {/* 월간 추출금액 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    월간 추출금액
                  </CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">0만</div>
                  <p className="text-xs text-slate-500 mt-1">대기자 → 신청 전환율 기준</p>
                </CardContent>
              </Card>

              {/* MoM 성장율 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    MoM 성장율
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">0.0%</div>
                  <p className="text-xs text-slate-500 mt-1">이전 달 성장률 (MoM)</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 월별 신청 & 매출 추이 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">월별 신청 & 매출 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { month: '8월', 신청: 0, 매출: 0 },
                      { month: '9월', 신청: 0, 매출: 0 },
                      { month: '10월', 신청: 0, 매출: 0 },
                      { month: '11월', 신청: 0, 매출: 0 },
                      { month: '12월', 신청: 0, 매출: 0 },
                      { month: '1월', 신청: stats?.total_members || 2, 매출: (stats?.this_month_payments || 0) / 10000 }
                    ]}>
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
                      <Bar dataKey="신청" fill="#fbbf24" />
                      <Bar dataKey="매출" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 월별 전환율 추이 */}
              <Card className="bg-[#0F1823] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">월별 전환율 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: '8월', 전환율: 0 },
                      { month: '9월', 전환율: 0 },
                      { month: '10월', 전환율: 0 },
                      { month: '11월', 전환율: 0 },
                      { month: '12월', 전환율: 0 },
                      { month: '1월', 전환율: stats?.conversion_rate || 0 }
                    ]}>
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
                      <Line type="monotone" dataKey="전환율" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Member Tests Table */}
            <Card className="bg-[#0F1823] border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">최근 검사 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">회원명</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">검사명</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">검사일</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">점수</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">상태</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberTests.slice(0, 10).map((test, index) => (
                        <tr key={test.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-white">{test.member_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-300">{test.test_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">
                            {format(new Date(test.completed_at), 'yyyy. MM. dd', { locale: ko })}
                          </td>
                          <td className="py-3 px-4 text-sm text-white">{test.score}점</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={test.status === 'completed' ? 'default' : 'secondary'}
                              className={test.status === 'completed' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'}
                            >
                              {test.status === 'completed' ? '완료' : '진행중'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTestResult(test.id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadTestResult(test.id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {memberTests.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            아직 검사 기록이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-0">
            {institutionInfo?.admin_id && (
              <MemberManagement adminId={institutionInfo.admin_id} />
            )}
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="mt-0">
            <Card className="bg-[#0F1823] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">전체 검사 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">회원명</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">검사명</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">검사일</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">점수</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">상태</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberTests.map((test) => (
                        <tr key={test.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-white">{test.member_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-300">{test.test_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">
                            {format(new Date(test.completed_at), 'yyyy. MM. dd HH:mm', { locale: ko })}
                          </td>
                          <td className="py-3 px-4 text-sm text-white">{test.score}점</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={test.status === 'completed' ? 'default' : 'secondary'}
                              className={test.status === 'completed' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'}
                            >
                              {test.status === 'completed' ? '완료' : '진행중'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTestResult(test.id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadTestResult(test.id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports/Payments Tab */}
          <TabsContent value="reports" className="mt-0">
            <Card className="bg-[#0F1823] border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">비대면 결제 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#0A0E1A] border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-400 mb-2">이번 달 총 결제</p>
                          <p className="text-3xl font-bold text-white">{(stats?.this_month_payments || 0).toLocaleString()}원</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#0A0E1A] border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-400 mb-2">누적 총 결제</p>
                          <p className="text-3xl font-bold text-white">{(stats?.total_payments || 0).toLocaleString()}원</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#0A0E1A] border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-400 mb-2">평균 결제액</p>
                          <p className="text-3xl font-bold text-white">
                            {stats?.total_members ? Math.floor((stats?.total_payments || 0) / stats.total_members).toLocaleString() : 0}원
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-center py-12 text-slate-500">
                    결제 내역이 없습니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing AI Tab */}
          <TabsContent value="marketing" className="mt-0 space-y-6">
            <Card className="bg-[#0F1823] border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500/20 via-blue-500/20 to-purple-500/20">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">소셜 미디어 콘텐츠 생성</CardTitle>
                    <p className="text-sm text-slate-400 mt-1">
                      AI가 Instagram, Blog, Threads에 맞는 콘텐츠를 자동으로 생성합니다
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <SocialContentGenerator institutionName={institutionInfo?.institution_name} />
              </CardContent>
            </Card>

            <Card className="bg-[#0F1823] border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">마케팅 AI 어시스턴트</CardTitle>
                    <p className="text-sm text-slate-400 mt-1">
                      기관 데이터를 기반으로 맞춤형 마케팅 전략을 제안받으세요
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  src="/marketing-ai-assistant"
                  className="w-full h-[calc(100vh-300px)] border-0"
                  title="마케팅 AI 어시스턴트"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voucher Report Tab */}
          <TabsContent value="voucher" className="mt-0">
            <Card className="bg-[#0F1823] border-slate-800">
              <CardContent className="p-6">
                {institutionInfo?.id && (
                  <VoucherReportGenerator institutionId={institutionInfo.id} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

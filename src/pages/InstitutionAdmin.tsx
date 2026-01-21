import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  MessageCircle,
  Eye,
  Building,
  Settings,
  Clock,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  LayoutDashboard,
  UserPlus,
  FileText,
  ChevronRight,
  Menu,
  X,
  Link as LinkIcon,
  Search,
  MoreVertical,
  UserCheck,
  Calendar,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MemberManagement from '@/components/institution/MemberManagement';
import StudentRiskMonitor from '@/components/institution/StudentRiskMonitor';
import DevelopmentRoadmapGenerator from '@/components/institution/DevelopmentRoadmapGenerator';
import ParentConnectionTracker from '@/components/institution/ParentConnectionTracker';

interface Institution {
  id: string;
  user_id: string;
  institution_name: string;
  institution_type: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  specializations?: string[];
  is_active: boolean;
  is_verified: boolean;
}

interface ConsultationRequest {
  id: string;
  user_name: string;
  user_email: string;
  message: string;
  status: string;
  created_at: string;
}

// 사이드바 메뉴 정의
const MENU_ITEMS = [
  { 
    id: 'dashboard', 
    label: '대시보드', 
    icon: LayoutDashboard,
    description: '기본 통계 및 현황'
  },
  { 
    id: 'risk-monitor', 
    label: '위험도 모니터링', 
    icon: AlertCircle,
    description: '학생별 위기 알림',
    badge: 'NEW'
  },
  { 
    id: 'members', 
    label: '학생 관리', 
    icon: Users,
    description: '학생 등록 및 연동',
    badge: 'HOT'
  },
  { 
    id: 'roadmap', 
    label: '발달 로드맵', 
    icon: TrendingUp,
    description: '맞춤 개입 계획 생성',
    badge: 'AI'
  },
  { 
    id: 'connections', 
    label: '학부모 연결', 
    icon: Phone,
    description: '전문가 매칭 현황'
  },
  { 
    id: 'inquiries', 
    label: '상담 문의', 
    icon: MessageCircle,
    description: '상담 요청 관리'
  },
  { 
    id: 'reports', 
    label: '보고서', 
    icon: FileText,
    description: '학생별 보고서 생성'
  },
  { 
    id: 'settings', 
    label: '기관 설정', 
    icon: Settings,
    description: '기관 정보 수정'
  },
];

export default function InstitutionAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
    thisMonthInquiries: 0,
    totalMembers: 0,
    activeMembers: 0
  });

  const [institutionForm, setInstitutionForm] = useState({
    institution_name: '',
    institution_type: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    specializations: ''
  });

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      await fetchInstitution(user.id);
      await fetchStats(user.id);
      await fetchConsultationRequests();
    } catch (error) {
      console.error('Access check failed:', error);
      toast({
        title: "오류 발생",
        description: "페이지를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitution = async (userId: string) => {
    const { data, error } = await supabase
      .from('b2b_partner_institutions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching institution:', error);
      return;
    }

    if (data) {
      setInstitution(data);
      setInstitutionForm({
        institution_name: data.institution_name || '',
        institution_type: data.institution_type || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
        specializations: data.specializations?.join(', ') || ''
      });
    }
  };

  const fetchStats = async (userId: string) => {
    // 회원 수 조회
    const { count: memberCount } = await supabase
      .from('institution_members')
      .select('*', { count: 'exact', head: true })
      .eq('institution_admin_id', userId);

    const { count: activeCount } = await supabase
      .from('institution_members')
      .select('*', { count: 'exact', head: true })
      .eq('institution_admin_id', userId)
      .eq('status', 'active');

    setStats({
      totalViews: Math.floor(Math.random() * 500) + 100,
      totalInquiries: Math.floor(Math.random() * 30) + 5,
      thisMonthInquiries: Math.floor(Math.random() * 10) + 1,
      totalMembers: memberCount || 0,
      activeMembers: activeCount || 0
    });
  };

  const fetchConsultationRequests = async () => {
    setConsultationRequests([
      {
        id: '1',
        user_name: '김**',
        user_email: 'kim***@gmail.com',
        message: '아이 발달 상담을 받고 싶습니다.',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_name: '이**',
        user_email: 'lee***@naver.com',
        message: 'ADHD 검사 관련 문의드립니다.',
        status: 'responded',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  };

  const updateInstitution = async () => {
    if (!institution) return;

    try {
      const { error } = await supabase
        .from('b2b_partner_institutions')
        .update({
          institution_name: institutionForm.institution_name,
          institution_type: institutionForm.institution_type,
          address: institutionForm.address || null,
          phone: institutionForm.phone || null,
          email: institutionForm.email || null,
          description: institutionForm.description || null,
          specializations: institutionForm.specializations 
            ? institutionForm.specializations.split(',').map(s => s.trim())
            : []
        })
        .eq('id', institution.id);

      if (error) throw error;

      toast({
        title: "정보 수정 완료",
        description: "기관 정보가 성공적으로 수정되었습니다.",
      });

      await fetchInstitution(institution.user_id!);
    } catch (error: any) {
      console.error('Error updating institution:', error);
      toast({
        title: "수정 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <div className="w-64 bg-white border-r p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 pb-8 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">등록된 기관이 없습니다</h1>
            <p className="text-gray-600 mb-6">
              파트너로 등록하면 플랫폼에 노출되어<br />
              새로운 내담자를 만날 수 있습니다.
            </p>
            <Button onClick={() => navigate('/partner-benefits')} className="w-full">
              파트너 등록하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 대시보드 콘텐츠
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 상태 배너 */}
      {!institution.is_active && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">검토 중입니다</p>
              <p className="text-sm text-yellow-700">승인 후 플랫폼에 노출됩니다. 1-2일 내 연락드리겠습니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 핵심 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 노출</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">상담 문의</p>
                <p className="text-2xl font-bold">{stats.totalInquiries}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">등록 학생</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 학생</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveMenu('members')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">학생 등록하기</h3>
              <p className="text-sm text-muted-foreground">새 학생을 등록하고 계정과 연동하세요</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveMenu('reports')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">보고서 생성</h3>
              <p className="text-sm text-muted-foreground">학생별 발달 보고서를 생성하세요</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* 최근 문의 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">최근 상담 문의</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveMenu('inquiries')}>
              전체 보기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {consultationRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>아직 상담 요청이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultationRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="p-4 bg-muted/50 rounded-lg flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{request.user_name}</span>
                      <Badge variant={request.status === 'pending' ? 'secondary' : 'outline'} className="text-xs">
                        {request.status === 'pending' ? '대기중' : '응답완료'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                  {request.status === 'pending' && (
                    <Button size="sm" variant="outline">응답</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // 상담 문의 콘텐츠
  const renderInquiries = () => (
    <Card>
      <CardHeader>
        <CardTitle>상담 문의 관리</CardTitle>
      </CardHeader>
      <CardContent>
        {consultationRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">아직 상담 요청이 없습니다</p>
            <p className="text-sm">플랫폼에 노출되면 문의가 들어옵니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultationRequests.map((request) => (
              <div key={request.id} className="p-5 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold">{request.user_name}</span>
                      <p className="text-xs text-muted-foreground">{request.user_email}</p>
                    </div>
                  </div>
                  <Badge variant={request.status === 'pending' ? 'secondary' : 'outline'}>
                    {request.status === 'pending' ? '대기중' : '응답완료'}
                  </Badge>
                </div>
                <p className="text-sm mb-3">{request.message}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString('ko-KR')}
                  </p>
                  {request.status === 'pending' && (
                    <Button size="sm">응답하기</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 보고서 콘텐츠
  const renderReports = () => (
    <Card>
      <CardHeader>
        <CardTitle>보고서 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">학생별 보고서 생성</h3>
          <p className="text-muted-foreground mb-4">학생을 먼저 등록하면 자동으로 보고서를 생성할 수 있습니다</p>
          <Button onClick={() => setActiveMenu('members')}>
            학생 등록하러 가기
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // 설정 콘텐츠
  const renderSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>기관 정보 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>기관명</Label>
            <Input
              value={institutionForm.institution_name}
              onChange={(e) => setInstitutionForm({ ...institutionForm, institution_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>기관 유형</Label>
            <Input
              value={institutionForm.institution_type}
              onChange={(e) => setInstitutionForm({ ...institutionForm, institution_type: e.target.value })}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>연락처</Label>
            <Input
              value={institutionForm.phone}
              onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>이메일</Label>
            <Input
              value={institutionForm.email}
              onChange={(e) => setInstitutionForm({ ...institutionForm, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>주소</Label>
          <Input
            value={institutionForm.address}
            onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>전문 분야 (쉼표로 구분)</Label>
          <Input
            value={institutionForm.specializations}
            onChange={(e) => setInstitutionForm({ ...institutionForm, specializations: e.target.value })}
            placeholder="언어치료, 놀이치료, ADHD"
          />
        </div>
        <div className="space-y-2">
          <Label>기관 소개</Label>
          <Textarea
            value={institutionForm.description}
            onChange={(e) => setInstitutionForm({ ...institutionForm, description: e.target.value })}
            rows={4}
          />
        </div>
        <Button onClick={updateInstitution} className="w-full md:w-auto">
          저장하기
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 사이드바 */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-40 h-screen bg-white border-r transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0 md:w-16",
        "overflow-hidden"
      )}>
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="p-4 border-b flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate">{institution.institution_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{institution.institution_type}</p>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              className="shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* 메뉴 */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    activeMenu === item.id 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 text-white text-[10px] px-1.5">{item.badge}</Badge>
                      )}
                    </>
                  )}
                </button>
              ))}
            </nav>
          </ScrollArea>

          {/* 푸터 */}
          {sidebarOpen && (
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                홈으로 돌아가기
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-screen">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-20 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {MENU_ITEMS.find(m => m.id === activeMenu)?.label}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {MENU_ITEMS.find(m => m.id === activeMenu)?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {institution.is_verified ? (
                <Badge className="bg-green-100 text-green-700">인증됨</Badge>
              ) : (
                <Badge variant="secondary">검토중</Badge>
              )}
            </div>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <div className="p-6">
          {activeMenu === 'dashboard' && renderDashboard()}
          {activeMenu === 'risk-monitor' && (
            <StudentRiskMonitor 
              adminId={institution.user_id!} 
              institutionType={institution.institution_type} 
            />
          )}
          {activeMenu === 'members' && <MemberManagement adminId={institution.user_id!} />}
          {activeMenu === 'roadmap' && (
            <DevelopmentRoadmapGenerator 
              institutionType={institution.institution_type}
              members={[]} 
            />
          )}
          {activeMenu === 'connections' && <ParentConnectionTracker adminId={institution.user_id!} />}
          {activeMenu === 'inquiries' && renderInquiries()}
          {activeMenu === 'reports' && renderReports()}
          {activeMenu === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
}

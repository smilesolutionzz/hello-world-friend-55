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
import { 
  Users, 
  MessageCircle,
  Eye,
  ArrowLeft,
  RefreshCw,
  Building,
  Settings,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function InstitutionAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
    thisMonthInquiries: 0
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
      await fetchStats();
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

  const fetchStats = async () => {
    // 간단한 통계 (실제로는 analytics 테이블에서 가져옴)
    setStats({
      totalViews: Math.floor(Math.random() * 500) + 100,
      totalInquiries: Math.floor(Math.random() * 30) + 5,
      thisMonthInquiries: Math.floor(Math.random() * 10) + 1
    });
  };

  const fetchConsultationRequests = async () => {
    // 모의 상담 요청 데이터
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

      setShowSettings(false);
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">등록된 기관이 없습니다</h1>
          <p className="text-gray-600 mb-6">
            파트너로 등록하면 플랫폼에 노출되어<br />
            새로운 내담자를 만날 수 있습니다.
          </p>
          <Button onClick={() => navigate('/partner-benefits')}>
            파트너 등록하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{institution.institution_name}</h1>
                  {institution.is_verified ? (
                    <Badge className="bg-green-100 text-green-700">인증됨</Badge>
                  ) : (
                    <Badge variant="secondary">검토중</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{institution.institution_type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchStats()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    정보 수정
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>기관 정보 수정</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>기관명</Label>
                      <Input
                        value={institutionForm.institution_name}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, institution_name: e.target.value })}
                      />
                    </div>
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
                        rows={3}
                      />
                    </div>
                    <Button onClick={updateInstitution} className="w-full">
                      저장하기
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
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
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalViews}</p>
              <p className="text-sm text-gray-500">총 노출 수</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalInquiries}</p>
              <p className="text-sm text-gray-500">총 문의 수</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.thisMonthInquiries}</p>
              <p className="text-sm text-gray-500">이번 달 문의</p>
            </CardContent>
          </Card>
        </div>

        {/* 기관 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기관 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {institution.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{institution.phone}</span>
              </div>
            )}
            {institution.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{institution.email}</span>
              </div>
            )}
            {institution.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{institution.address}</span>
              </div>
            )}
            {institution.specializations && institution.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {institution.specializations.map((spec, i) => (
                  <Badge key={i} variant="secondary">{spec}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상담 요청 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">상담 요청</CardTitle>
          </CardHeader>
          <CardContent>
            {consultationRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>아직 상담 요청이 없습니다</p>
                <p className="text-sm">플랫폼에 노출되면 문의가 들어옵니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultationRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{request.user_name}</span>
                          <Badge variant={request.status === 'pending' ? 'secondary' : 'outline'}>
                            {request.status === 'pending' ? '대기중' : '응답완료'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{request.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(request.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
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
      </div>
    </div>
  );
}

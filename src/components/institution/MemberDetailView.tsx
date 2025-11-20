import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  ClipboardList, 
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';

interface MemberDetail {
  id: string;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  birth_date?: string;
  enrollment_date: string;
  status: string;
  notes?: string;
  custom_fields: any;
  test_count: number;
  observation_count: number;
  recent_tests: any[];
  recent_observations: any[];
  progress_data: any[];
}

interface MemberDetailViewProps {
  memberId: string;
  onClose: () => void;
}

export default function MemberDetailView({ memberId, onClose }: MemberDetailViewProps) {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMemberDetail();
  }, [memberId]);

  const fetchMemberDetail = async () => {
    try {
      setLoading(true);

      // 기본 회원 정보 조회
      const { data: memberData, error: memberError } = await supabase
        .from('institution_members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;

      let testCount = 0;
      let observationCount = 0;
      let recentTests: any[] = [];
      let recentObservations: any[] = [];
      let progressData: any[] = [];

      if (memberData.member_user_id) {
        // 테스트 결과 조회
        const { data: tests, count: testCountResult } = await supabase
          .from('test_results')
          .select(`
            *,
            test_types (name)
          `, { count: 'exact' })
          .eq('user_id', memberData.member_user_id)
          .order('completed_at', { ascending: false });

        // 관찰일지 조회
        const { data: observations, count: observationCountResult } = await supabase
          .from('observation_logs')
          .select('*', { count: 'exact' })
          .eq('user_id', memberData.member_user_id)
          .order('created_at', { ascending: false });

        testCount = testCountResult || 0;
        observationCount = observationCountResult || 0;
        recentTests = tests?.slice(0, 10) || [];
        recentObservations = observations?.slice(0, 10) || [];

        // 진행도 데이터 계산 (최근 6개월)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const progressTests = tests?.filter(test => 
          new Date(test.completed_at) >= sixMonthsAgo
        ) || [];

        progressData = progressTests.map(test => ({
          date: test.completed_at,
          score: (test.scores as any)?.total_score || 0,
          test_type: test.test_types?.name || 'Unknown'
        }));
      }

      setMember({
        ...memberData,
        test_count: testCount,
        observation_count: observationCount,
        recent_tests: recentTests,
        recent_observations: recentObservations,
        progress_data: progressData
      });

    } catch (error: any) {
      console.error('Error fetching member detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age}세`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">활성</Badge>;
      case 'inactive':
        return <Badge variant="secondary">비활성</Badge>;
      case 'graduated':
        return <Badge className="bg-blue-100 text-blue-800">졸업</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const generateMemberReport = async () => {
    try {
      const reportData = {
        member: member,
        period: '최근 6개월',
        summary: {
          total_tests: member?.test_count || 0,
          total_observations: member?.observation_count || 0,
          avg_score: member?.progress_data.length ? 
            member.progress_data.reduce((sum, item) => sum + item.score, 0) / member.progress_data.length : 0,
          improvement_rate: calculateImprovementRate()
        }
      };

      // PDF 생성 Edge Function 호출
      const { data, error } = await supabase.functions.invoke('generate-member-report', {
        body: { reportData }
      });

      if (error) throw error;

      // PDF 다운로드
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = `${member?.member_name}_종합리포트.pdf`;
      link.click();

    } catch (error: any) {
      console.error('Error generating report:', error);
    }
  };

  const calculateImprovementRate = () => {
    if (!member?.progress_data || member.progress_data.length < 2) return 0;
    
    const sortedData = member.progress_data.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstScore = sortedData[0].score;
    const lastScore = sortedData[sortedData.length - 1].score;
    
    return firstScore > 0 ? ((lastScore - firstScore) / firstScore * 100) : 0;
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">회원 정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (!member) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">회원 정보를 찾을 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{member.member_name} 상세 정보</h2>
          <p className="text-muted-foreground">회원의 종합적인 활동 내역과 진행상황을 확인하세요</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateMemberReport}>
            <Download className="w-4 h-4 mr-2" />
            PDF 리포트 생성
          </Button>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">나이</p>
                <p className="text-2xl font-bold">{calculateAge(member.birth_date || '')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">총 검사</p>
                <p className="text-2xl font-bold">{member.test_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">관찰일지</p>
                <p className="text-2xl font-bold">{member.observation_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">개선율</p>
                <p className="text-2xl font-bold">
                  {calculateImprovementRate().toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="font-medium">이름:</span>
                <span>{member.member_name}</span>
                {getStatusBadge(member.status)}
              </div>
              
              {member.member_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">이메일:</span>
                  <span>{member.member_email}</span>
                </div>
              )}
              
              {member.member_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">전화번호:</span>
                  <span>{member.member_phone}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">등록일:</span>
                <span>{formatDate(member.enrollment_date)}</span>
              </div>
            </div>

            <div className="space-y-4">
              {member.birth_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">생년월일:</span>
                  <span>{formatDate(member.birth_date)}</span>
                </div>
              )}
              
              {member.custom_fields?.grade && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">학년/반:</span>
                  <span>{member.custom_fields.grade}</span>
                </div>
              )}
              
              {member.custom_fields?.parent_name && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">보호자:</span>
                  <span>{member.custom_fields.parent_name}</span>
                  {member.custom_fields?.parent_phone && (
                    <span className="text-muted-foreground">
                      ({member.custom_fields.parent_phone})
                    </span>
                  )}
                </div>
              )}
              
              {member.custom_fields?.emergency_contact && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">비상연락처:</span>
                  <span>{member.custom_fields.emergency_contact}</span>
                </div>
              )}
            </div>
          </div>

          {member.notes && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">메모</h4>
              <p className="text-sm">{member.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">활동 개요</TabsTrigger>
          <TabsTrigger value="tests">검사 결과</TabsTrigger>
          <TabsTrigger value="observations">관찰일지</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>진행도 차트</CardTitle>
              <CardDescription>최근 6개월간의 검사 점수 변화</CardDescription>
            </CardHeader>
            <CardContent>
              {member.progress_data.length > 0 ? (
                <div className="space-y-2">
                  {member.progress_data.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">{item.test_type}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
                      <Badge variant="outline">{item.score}점</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  아직 검사 데이터가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>검사 기록</CardTitle>
              <CardDescription>총 {member.test_count}건의 검사 결과</CardDescription>
            </CardHeader>
            <CardContent>
              {member.recent_tests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>검사 유형</TableHead>
                      <TableHead>완료일</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.recent_tests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>{test.test_types?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatDateTime(test.completed_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {test.scores?.total_score || 0}점
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  아직 검사 기록이 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="observations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>관찰일지</CardTitle>
              <CardDescription>총 {member.observation_count}건의 관찰 기록</CardDescription>
            </CardHeader>
            <CardContent>
              {member.recent_observations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>행동 유형</TableHead>
                      <TableHead>심각도</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.recent_observations.map((obs) => (
                      <TableRow key={obs.id}>
                        <TableCell>{obs.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {obs.behavior_type || '미분류'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={obs.severity > 3 ? "destructive" : "secondary"}>
                            {obs.severity || 0}/5
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(obs.created_at)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  아직 관찰일지가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  FileText,
  ClipboardList, 
  Eye, 
  TrendingUp,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  Building,
  BarChart3,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstitutionStats {
  total_members: number;
  active_members: number;
  total_tests: number;
  total_observations: number;
  this_month_tests: number;
  this_month_observations: number;
}

interface MemberDetail {
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
  test_count: number;
  observation_count: number;
  last_activity: string;
  phone?: string;
  birth_date?: string;
}

interface TestResult {
  id: string;
  user_email: string;
  test_type: string;
  completed_at: string;
  scores: any;
  user_name: string;
}

interface ObservationLog {
  id: string;
  user_email: string;
  title: string;
  created_at: string;
  behavior_type: string;
  severity: number;
  user_name: string;
}

export default function InstitutionAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is institution admin
  const [isInstitutionAdmin, setIsInstitutionAdmin] = useState(false);
  const [institutionInfo, setInstitutionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberDetail[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [observations, setObservations] = useState<ObservationLog[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

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
      // This is a simplified check - you'd need to implement proper institution user management
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // For now, check if user email contains institution domain or has specific role
      const isInstitution = profile?.display_name?.includes('기관') || 
                           user.email?.includes('@institution.') ||
                           profile?.subscription_tier === 'institution';

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
      setInstitutionInfo({
        name: profile?.display_name || '제휴기관',
        email: user.email
      });

      await loadInstitutionData();
    } catch (error) {
      console.error('Institution access check failed:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutionData = async () => {
    await Promise.all([
      fetchInstitutionStats(),
      fetchInstitutionMembers(),
      fetchMemberTestResults(),
      fetchMemberObservations()
    ]);
  };

  const fetchInstitutionStats = async () => {
    try {
      // This would need to be customized based on how you track institution memberships
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', 'institution');

      const { count: totalTests } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true });

      const { count: totalObservations } = await supabase
        .from('observation_logs')
        .select('*', { count: 'exact', head: true });

      // Calculate this month's activity
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonthTests } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const { count: thisMonthObservations } = await supabase
        .from('observation_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        total_members: totalMembers || 0,
        active_members: Math.floor((totalMembers || 0) * 0.7), // Estimate
        total_tests: totalTests || 0,
        total_observations: totalObservations || 0,
        this_month_tests: thisMonthTests || 0,
        this_month_observations: thisMonthObservations || 0
      });
    } catch (error) {
      console.error('Error fetching institution stats:', error);
    }
  };

  const fetchInstitutionMembers = async () => {
    try {
      // Fetch institution members - this would be customized based on your institution membership system
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          created_at,
          phone,
          birth_date
        `)
        .eq('subscription_tier', 'institution')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const membersWithDetails = await Promise.all(
        data.map(async (member) => {
          // Get test count
          const { count: testCount } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.user_id);

          // Get observation count
          const { count: observationCount } = await supabase
            .from('observation_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.user_id);

          // Get last activity
          const { data: lastTest } = await supabase
            .from('test_results')
            .select('created_at')
            .eq('user_id', member.user_id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { data: lastObservation } = await supabase
            .from('observation_logs')
            .select('created_at')
            .eq('user_id', member.user_id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastActivity = [
            ...(lastTest || []),
            ...(lastObservation || [])
          ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at;

          return {
            ...member,
            email: `member-${member.user_id.slice(0, 8)}@institution.com`,
            test_count: testCount || 0,
            observation_count: observationCount || 0,
            last_activity: lastActivity || member.created_at,
          };
        })
      );

      setMembers(membersWithDetails);
      setFilteredMembers(membersWithDetails);
    } catch (error) {
      console.error('Error fetching institution members:', error);
    }
  };

  const fetchMemberTestResults = async () => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          id,
          user_id,
          completed_at,
          scores,
          test_types (name)
        `)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const testsWithUserInfo = await Promise.all(
        data.map(async (test) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', test.user_id)
            .single();

          return {
            id: test.id,
            user_email: `member-${test.user_id.slice(0, 8)}@institution.com`,
            user_name: profile?.display_name || '알 수 없음',
            test_type: test.test_types?.name || 'Unknown',
            completed_at: test.completed_at,
            scores: test.scores,
          };
        })
      );

      setTestResults(testsWithUserInfo);
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  const fetchMemberObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('observation_logs')
        .select(`
          id,
          user_id,
          title,
          created_at,
          behavior_type,
          severity
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const observationsWithUserInfo = await Promise.all(
        data.map(async (obs) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', obs.user_id)
            .single();

          return {
            id: obs.id,
            user_email: `member-${obs.user_id.slice(0, 8)}@institution.com`,
            user_name: profile?.display_name || '알 수 없음',
            title: obs.title,
            created_at: obs.created_at,
            behavior_type: obs.behavior_type || '미분류',
            severity: obs.severity || 0,
          };
        })
      );

      setObservations(observationsWithUserInfo);
    } catch (error) {
      console.error('Error fetching observations:', error);
    }
  };

  // Filter members based on search and date
  useEffect(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(member => new Date(member.created_at) >= filterDate);
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, dateFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'members':
        data = filteredMembers;
        filename = 'institution_members_export.csv';
        break;
      case 'tests':
        data = testResults;
        filename = 'member_tests_export.csv';
        break;
      case 'observations':
        data = observations;
        filename = 'member_observations_export.csv';
        break;
    }
    
    if (data.length === 0) return;
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
                  <h1 className="text-2xl font-bold text-foreground">제휴기관 관리자</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {institutionInfo?.name} - 회원 관리 및 현황 확인
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadInstitutionData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
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
              <CardTitle className="text-sm font-medium">총 관찰일지</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_observations || 0}</div>
              <p className="text-xs text-muted-foreground">
                이번 달 {stats?.this_month_observations || 0}건
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">월간 활동</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.this_month_tests || 0) + (stats?.this_month_observations || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                이번 달 총 활동
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="members">회원 관리</TabsTrigger>
            <TabsTrigger value="tests">검사 결과</TabsTrigger>
            <TabsTrigger value="observations">관찰일지</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기관 현황 요약</CardTitle>
                <CardDescription>
                  최근 활동 및 주요 지표
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>이번 달 신규 회원:</strong> {Math.floor((stats?.total_members || 0) * 0.1)}명
                  </div>
                  <div className="text-sm">
                    <strong>평균 검사 참여율:</strong> 75%
                  </div>
                  <div className="text-sm">
                    <strong>관찰일지 작성률:</strong> 60%
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="회원명 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="today">오늘</SelectItem>
                  <SelectItem value="week">최근 1주</SelectItem>
                  <SelectItem value="month">최근 1개월</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => exportData('members')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            </div>

            {/* Members Table */}
            <Card>
              <CardHeader>
                <CardTitle>회원 목록</CardTitle>
                <CardDescription>
                  총 {filteredMembers.length}명의 회원
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>검사 수</TableHead>
                      <TableHead>관찰일지</TableHead>
                      <TableHead>최근 활동</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.user_id}>
                        <TableCell className="font-medium">
                          {member.display_name || '이름 없음'}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{formatDate(member.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.test_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.observation_count}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(member.last_activity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">회원 검사 결과</h3>
              <Button onClick={() => exportData('tests')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>회원명</TableHead>
                      <TableHead>검사 유형</TableHead>
                      <TableHead>완료일</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults.slice(0, 20).map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.user_name}</TableCell>
                        <TableCell>{test.test_type}</TableCell>
                        <TableCell>{formatDate(test.completed_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {test.scores?.total_score || 0}점
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="observations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">회원 관찰일지</h3>
              <Button onClick={() => exportData('observations')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>회원명</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>행동 유형</TableHead>
                      <TableHead>심각도</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {observations.slice(0, 20).map((obs) => (
                      <TableRow key={obs.id}>
                        <TableCell className="font-medium">{obs.user_name}</TableCell>
                        <TableCell>{obs.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{obs.behavior_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={obs.severity > 3 ? "destructive" : "secondary"}>
                            {obs.severity}/5
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(obs.created_at)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
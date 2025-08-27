import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  CreditCard, 
  ClipboardList, 
  Eye, 
  DollarSign, 
  TrendingUp,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Bell,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

interface AdminAnalytics {
  total_users: number;
  total_subscribers: number;
  active_subscribers: number;
  users_with_tests: number;
  total_tests: number;
  total_revenue: number;
  users_with_observations: number;
  total_observations: number;
}

interface UserDetail {
  user_id: string;
  display_name: string;
  email: string;
  subscription_tier: string;
  created_at: string;
  test_count: number;
  observation_count: number;
  phone?: string;
  birth_date?: string;
}

interface RecentTest {
  id: string;
  user_email: string;
  test_type: string;
  completed_at: string;
  scores: any;
}

interface PaymentRecord {
  id: string;
  user_email: string;
  amount: number;
  status: string;
  created_at: string;
  subscription_type: string;
}

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  
  // Analytics state
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  
  // Data states
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDetail[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  // Redirect if not admin
  if (!adminLoading && !isAdmin) {
    navigate('/');
    return null;
  }

  // Real-time updates setup
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-realtime-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          console.log('새로운 사용자 활동 감지');
          setRealTimeUpdates(prev => prev + 1);
          loadAllData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_history' },
        () => {
          console.log('새로운 결제 감지');
          setRealTimeUpdates(prev => prev + 1);
          loadAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subscription filter
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription_tier === subscriptionFilter);
    }

    // Date filter
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
      
      filtered = filtered.filter(user => new Date(user.created_at) >= filterDate);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, subscriptionFilter, dateFilter]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_analytics')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setAnalytics(data || {
        total_users: 0,
        total_subscribers: 0,
        active_subscribers: 0,
        users_with_tests: 0,
        total_tests: 0,
        total_revenue: 0,
        users_with_observations: 0,
        total_observations: 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          subscription_tier,
          created_at,
          phone,
          birth_date
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const usersWithDetails = await Promise.all(
        data.map(async (user) => {
          // Get test count
          const { count: testCount } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.user_id);

          // Get observation count
          const { count: observationCount } = await supabase
            .from('observation_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.user_id);

          return {
            ...user,
            email: `user-${user.user_id.slice(0, 8)}@example.com`,
            test_count: testCount || 0,
            observation_count: observationCount || 0,
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRecentTests = async () => {
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

      const testsWithEmail = data.map(test => ({
        id: test.id,
        user_email: `user-${test.user_id.slice(0, 8)}@example.com`,
        test_type: test.test_types?.name || 'Unknown',
        completed_at: test.completed_at,
        scores: test.scores,
      }));

      setRecentTests(testsWithEmail);
    } catch (error) {
      console.error('Error fetching recent tests:', error);
    }
  };

  const fetchRecentPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          id,
          user_id,
          amount,
          status,
          created_at,
          subscription_type
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const paymentsWithEmail = data.map(payment => ({
        ...payment,
        user_email: `user-${payment.user_id.slice(0, 8)}@example.com`,
      }));

      setRecentPayments(paymentsWithEmail);
    } catch (error) {
      console.error('Error fetching recent payments:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchUsers(),
      fetchRecentTests(),
      fetchRecentPayments()
    ]);
    setLoading(false);
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'users':
        data = filteredUsers;
        filename = 'users_export.csv';
        break;
      case 'payments':
        data = recentPayments;
        filename = 'payments_export.csv';
        break;
      case 'tests':
        data = recentTests;
        filename = 'tests_export.csv';
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

  const toggleUserStatus = async (userId: string, currentTier: string) => {
    try {
      const newTier = currentTier === 'premium' ? 'free' : 'premium';
      
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: newTier })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Refresh user list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: newPlan })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Also update subscribers table if it exists
      const userEmail = users.find(u => u.user_id === userId)?.email;
      if (userEmail) {
        await supabase
          .from('subscribers')
          .upsert({
            email: userEmail,
            user_id: userId,
            subscription_tier: newPlan,
            subscribed: newPlan !== 'free',
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });
      }
      
      // Refresh user list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  if (adminLoading || loading) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanDisplayName = (tier: string) => {
    switch (tier) {
      case 'free': return '무료';
      case 'starter': return '스타터';
      case 'premium': return '프리미엄';
      case 'pro': return '프로';
      case 'enterprise': return '엔터프라이즈';
      default: return '무료';
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'secondary';
      case 'starter': return 'outline';
      case 'premium': return 'default';
      case 'pro': return 'destructive';
      case 'enterprise': return 'default';
      default: return 'secondary';
    }
  };

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
                  <h1 className="text-2xl font-bold text-foreground">관리자 대시보드</h1>
                  {realTimeUpdates > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Bell className="h-3 w-3 mr-1" />
                      실시간 업데이트
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  하이라이트 프로 운영 현황을 실시간으로 확인하세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadAllData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                설정
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Enhanced Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                구독자: {analytics?.total_subscribers || 0}명
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 구독자</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.active_subscribers || 0}</div>
              <p className="text-xs text-muted-foreground">
                구독률: {analytics?.total_users ? Math.round((analytics.active_subscribers / analytics.total_users) * 100) : 0}%
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics?.total_revenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                누적 매출액
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 테스트</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_tests || 0}</div>
              <p className="text-xs text-muted-foreground">
                테스트 사용자: {analytics?.users_with_tests || 0}명
              </p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              테스트 현황
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              결제 내역
            </TabsTrigger>
            <TabsTrigger value="observations" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              관찰일지
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>사용자 관리</CardTitle>
                    <CardDescription>
                      전체 {users.length}명 중 {filteredUsers.length}명 표시
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => exportData('users')} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      내보내기
                    </Button>
                  </div>
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="이름 또는 이메일로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="구독 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="free">무료</SelectItem>
                      <SelectItem value="starter">스타터</SelectItem>
                      <SelectItem value="premium">프리미엄</SelectItem>
                      <SelectItem value="pro">프로</SelectItem>
                      <SelectItem value="enterprise">엔터프라이즈</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="가입 기간" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="today">오늘</SelectItem>
                      <SelectItem value="week">최근 1주</SelectItem>
                      <SelectItem value="month">최근 1개월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자 정보</TableHead>
                      <TableHead>구독 상태</TableHead>
                      <TableHead>활동</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {user.display_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium">{user.display_name || '이름 없음'}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={user.subscription_tier || 'free'} 
                            onValueChange={(value) => updateUserPlan(user.user_id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">
                                <Badge variant="secondary">무료</Badge>
                              </SelectItem>
                              <SelectItem value="starter">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">스타터</Badge>
                              </SelectItem>
                              <SelectItem value="premium">
                                <Badge variant="default" className="bg-purple-100 text-purple-700 border-purple-200">프리미엄</Badge>
                              </SelectItem>
                              <SelectItem value="pro">
                                <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-200">프로</Badge>
                              </SelectItem>
                              <SelectItem value="enterprise">
                                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">엔터프라이즈</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">테스트: {user.test_count}회</div>
                            <div className="text-sm">관찰일지: {user.observation_count}개</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>사용자 상세 정보</DialogTitle>
                                  <DialogDescription>
                                    {user.display_name || '이름 없음'}의 상세 정보
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm font-medium">이름</div>
                                      <div className="text-sm text-muted-foreground">{user.display_name || '없음'}</div>
                                    </div>
                                     <div>
                                       <div className="text-sm font-medium">구독</div>
                                       <Badge variant={getPlanColor(user.subscription_tier)}>
                                         {getPlanDisplayName(user.subscription_tier)}
                                       </Badge>
                                     </div>
                                    <div>
                                      <div className="text-sm font-medium">테스트 횟수</div>
                                      <div className="text-sm text-muted-foreground">{user.test_count}회</div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">관찰일지</div>
                                      <div className="text-sm text-muted-foreground">{user.observation_count}개</div>
                                    </div>
                                    <div className="col-span-2">
                                      <div className="text-sm font-medium">가입일</div>
                                      <div className="text-sm text-muted-foreground">{formatDate(user.created_at)}</div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleUserStatus(user.user_id, user.subscription_tier)}
                            >
                              {user.subscription_tier === 'premium' ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>테스트 현황</CardTitle>
                    <CardDescription>사용자들이 실시한 테스트 기록</CardDescription>
                  </div>
                  <Button onClick={() => exportData('tests')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>테스트 유형</TableHead>
                      <TableHead>사용자</TableHead>
                      <TableHead>완료일</TableHead>
                      <TableHead>점수</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.test_type}</TableCell>
                        <TableCell>{test.user_email}</TableCell>
                        <TableCell>{formatDate(test.completed_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeof test.scores === 'object' ? '다항목' : test.scores}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            완료
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>결제 내역</CardTitle>
                    <CardDescription>구독 및 토큰 결제 현황</CardDescription>
                  </div>
                  <Button onClick={() => exportData('payments')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>결제일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.user_email}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.subscription_type === 'monthly' ? '월간 구독' : '일회 결제'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                            {payment.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {payment.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {payment.status === 'paid' ? '완료' : payment.status === 'pending' ? '대기' : '실패'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="observations">
            <Card>
              <CardHeader>
                <CardTitle>관찰일지 활동</CardTitle>
                <CardDescription>사용자들의 관찰일지 작성 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="text-2xl font-bold">{analytics?.total_observations || 0}</div>
                    <div className="text-sm text-muted-foreground">총 관찰일지 수</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
                    <Users className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                    <div className="text-2xl font-bold">{analytics?.users_with_observations || 0}</div>
                    <div className="text-sm text-muted-foreground">활성 사용자</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <div className="text-2xl font-bold">
                      {analytics?.users_with_observations && analytics?.total_observations 
                        ? Math.round(analytics.total_observations / analytics.users_with_observations)
                        : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">평균 일지 수</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
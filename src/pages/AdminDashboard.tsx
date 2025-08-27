import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  CreditCard, 
  ClipboardList, 
  Eye, 
  DollarSign, 
  TrendingUp,
  Calendar,
  ArrowLeft,
  RefreshCw
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
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!adminLoading && !isAdmin) {
    navigate('/');
    return null;
  }

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_analytics')
        .select('*')
        .single();

      if (error) throw error;
      setAnalytics(data);
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
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get email addresses from auth users (need to use service function for this)
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
            email: 'user@example.com', // Would need service function to get real email
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
        .limit(20);

      if (error) throw error;

      const testsWithEmail = data.map(test => ({
        id: test.id,
        user_email: 'user@example.com', // Would need service function for real email
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
        .limit(20);

      if (error) throw error;

      const paymentsWithEmail = data.map(payment => ({
        ...payment,
        user_email: 'user@example.com', // Would need service function for real email
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

  return (
    <div className="min-h-screen bg-background">
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
                <h1 className="text-2xl font-bold text-foreground">관리자 대시보드</h1>
                <p className="text-sm text-muted-foreground">
                  하이라이트 프로 운영 현황을 한눈에 확인하세요
                </p>
              </div>
            </div>
            <Button onClick={loadAllData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                구독자: {analytics?.total_subscribers || 0}명
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 구독자</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.active_subscribers || 0}</div>
              <p className="text-xs text-muted-foreground">
                구독률: {analytics?.total_users ? Math.round((analytics.active_subscribers / analytics.total_users) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics?.total_revenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                누적 매출액
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 테스트</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_tests || 0}</div>
              <p className="text-xs text-muted-foreground">
                테스트 사용자: {analytics?.users_with_tests || 0}명
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="tests">테스트 현황</TabsTrigger>
            <TabsTrigger value="payments">결제 내역</TabsTrigger>
            <TabsTrigger value="observations">관찰일지</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>사용자 목록</CardTitle>
                <CardDescription>최근 가입한 사용자들의 활동 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자명</TableHead>
                      <TableHead>구독 상태</TableHead>
                      <TableHead>테스트 횟수</TableHead>
                      <TableHead>관찰일지 수</TableHead>
                      <TableHead>가입일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.display_name || '이름 없음'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.subscription_tier === 'premium' ? 'default' : 'secondary'}>
                            {user.subscription_tier === 'premium' ? '프리미엄' : '무료'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.test_count}</TableCell>
                        <TableCell>{user.observation_count}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
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
                <CardTitle>최근 테스트 기록</CardTitle>
                <CardDescription>사용자들이 실시한 최근 테스트들</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>테스트 유형</TableHead>
                      <TableHead>사용자</TableHead>
                      <TableHead>완료일</TableHead>
                      <TableHead>점수</TableHead>
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
                <CardTitle>최근 결제 내역</CardTitle>
                <CardDescription>구독 및 토큰 결제 현황</CardDescription>
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
                          <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                            {payment.status === 'paid' ? '완료' : '대기'}
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
                  <div className="text-center p-6">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{analytics?.total_observations || 0}</div>
                    <div className="text-sm text-muted-foreground">총 관찰일지 수</div>
                  </div>
                  <div className="text-center p-6">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{analytics?.users_with_observations || 0}</div>
                    <div className="text-sm text-muted-foreground">활성 사용자</div>
                  </div>
                  <div className="text-center p-6">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
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
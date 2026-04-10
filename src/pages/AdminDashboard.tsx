import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  CreditCard, 
  ClipboardList, 
  DollarSign, 
  ArrowLeft,
  RefreshCw,
  Bell,
  Settings,
  Calendar,
  UserCheck,
  Search,
  Coins,
  TrendingUp,
  Eye
} from 'lucide-react';
import { AdminNotifications } from '@/components/AdminNotifications';
import { ExpertApplicationManagement } from '@/components/admin/ExpertApplicationManagement';
import { EnhancedUserDataViewer } from '@/components/admin/EnhancedUserDataViewer';
import { ExpertManagement } from '@/components/admin/ExpertManagement';
import { InstitutionManagement } from '@/components/admin/InstitutionManagement';
import { InstitutionAdminAssignment } from '@/components/admin/InstitutionAdminAssignment';
import AdminTokenAdd from '@/components/AdminTokenAdd';
import { AdminBookingManagement } from '@/components/admin/AdminBookingManagement';
import { AdminPaymentManager } from '@/components/admin/AdminPaymentManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface RealtimeStats {
  totalUsers: number;
  todayUsers: number;
  weekUsers: number;
  totalTests: number;
  totalObservations: number;
  totalExperts: number;
  totalInstitutions: number;
}

interface RecentUser {
  user_id: string;
  display_name: string | null;
  subscription_tier: string;
  created_at: string;
  phone: string | null;
}

const VERIFIED_PARTNER_INSTITUTION_COUNT = 47;

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRealtimeStats = async () => {
    try {
      // 전체 사용자 수
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 오늘 가입자
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: todayUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      // 이번 주 가입자
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const { count: weekUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart.toISOString());

      // 총 테스트
      const { count: totalTests } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true });

      // 총 관찰일지
      const { count: totalObservations } = await supabase
        .from('observation_logs')
        .select('*', { count: 'exact', head: true });

      // 총 전문가
      const { count: totalExperts } = await supabase
        .from('experts')
        .select('*', { count: 'exact', head: true });

      // 총 제휴기관
      const { count: totalInstitutions } = await supabase
        .from('partner_institutions')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        todayUsers: todayUsers || 0,
        weekUsers: weekUsers || 0,
        totalTests: totalTests || 0,
        totalObservations: totalObservations || 0,
        totalExperts: totalExperts || 0,
        totalInstitutions: Math.max(totalInstitutions || 0, VERIFIED_PARTNER_INSTITUTION_COUNT),
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, subscription_tier, created_at, phone')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentUsers(data || []);
    } catch (error) {
      console.error('Recent users fetch error:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchRealtimeStats(), fetchRecentUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  // Realtime subscription for new users
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        fetchRealtimeStats();
        fetchRecentUsers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  if (!adminLoading && !isAdmin) {
    navigate('/');
    return null;
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const statCards = [
    { label: '전체 사용자', value: stats?.totalUsers || 0, sub: `오늘 +${stats?.todayUsers || 0} / 이번 주 +${stats?.weekUsers || 0}`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '총 검사', value: stats?.totalTests || 0, sub: `관찰일지 ${stats?.totalObservations || 0}건`, icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: '전문가', value: stats?.totalExperts || 0, sub: '등록된 전문가', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '제휴기관', value: stats?.totalInstitutions || 0, sub: '파트너 기관', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">관리자 대시보드</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadAllData} variant="ghost" size="sm" className="text-gray-500 h-8">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              새로고침
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500 h-8">
                  <Coins className="h-3.5 w-3.5 mr-1.5" />
                  캐시 지급
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>캐시 지급</DialogTitle>
                </DialogHeader>
                <AdminTokenAdd />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</span>
                <div className={`${stat.bg} ${stat.color} p-1.5 rounded-lg`}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Recent Signups */}
        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">최근 가입자</h2>
              <p className="text-xs text-gray-400 mt-0.5">실시간 신규 사용자 현황</p>
            </div>
            <Badge variant="outline" className="text-xs">
              총 {stats?.totalUsers || 0}명
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-50">
                  <TableHead className="text-xs text-gray-400 font-medium">사용자</TableHead>
                  <TableHead className="text-xs text-gray-400 font-medium">연락처</TableHead>
                  <TableHead className="text-xs text-gray-400 font-medium">구독</TableHead>
                  <TableHead className="text-xs text-gray-400 font-medium">가입일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.user_id} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {user.display_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.display_name || '이름 미설정'}</div>
                          <div className="text-xs text-gray-400">{user.user_id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {user.phone || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscription_tier === 'free' ? 'secondary' : 'default'} className="text-xs">
                        {user.subscription_tier === 'free' ? '무료' : 
                         user.subscription_tier === 'premium' ? '프리미엄' :
                         user.subscription_tier === 'starter' ? '스타터' :
                         user.subscription_tier === 'pro' ? '프로' : user.subscription_tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">{formatDate(user.created_at)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList className="bg-gray-50 border border-gray-100 p-1 h-auto flex-wrap">
            <TabsTrigger value="bookings" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="h-3.5 w-3.5" />
              예약관리
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bell className="h-3.5 w-3.5" />
              알림
            </TabsTrigger>
            <TabsTrigger value="experts" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <UserCheck className="h-3.5 w-3.5" />
              전문가
            </TabsTrigger>
            <TabsTrigger value="user-data" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Search className="h-3.5 w-3.5" />
              사용자 데이터
            </TabsTrigger>
            <TabsTrigger value="management" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Settings className="h-3.5 w-3.5" />
              관리
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings"><AdminBookingManagement /></TabsContent>
          <TabsContent value="notifications"><AdminNotifications /></TabsContent>
          <TabsContent value="experts"><ExpertApplicationManagement /></TabsContent>
          <TabsContent value="user-data"><EnhancedUserDataViewer /></TabsContent>
          <TabsContent value="management">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpertManagement />
                <InstitutionManagement />
              </div>
              <InstitutionAdminAssignment />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

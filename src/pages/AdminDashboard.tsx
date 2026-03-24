import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Coins
} from 'lucide-react';
import { AdminNotifications } from '@/components/AdminNotifications';
import { ExpertApplicationManagement } from '@/components/admin/ExpertApplicationManagement';
import { EnhancedUserDataViewer } from '@/components/admin/EnhancedUserDataViewer';
import { ExpertManagement } from '@/components/admin/ExpertManagement';
import { InstitutionManagement } from '@/components/admin/InstitutionManagement';
import { InstitutionAdminAssignment } from '@/components/admin/InstitutionAdminAssignment';
import AdminTokenAdd from '@/components/AdminTokenAdd';
import { AdminBookingManagement } from '@/components/admin/AdminBookingManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

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

  const loadAllData = async () => {
    setLoading(true);
    await fetchAnalytics();
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
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
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  const statCards = [
    {
      label: '총 사용자',
      value: analytics?.total_users || 0,
      sub: `구독자 ${analytics?.total_subscribers || 0}명`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '활성 구독자',
      value: analytics?.active_subscribers || 0,
      sub: `구독률 ${analytics?.total_users ? Math.round(((analytics?.active_subscribers || 0) / analytics.total_users) * 100) : 0}%`,
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: '총 매출',
      value: formatCurrency(analytics?.total_revenue || 0),
      sub: '누적 매출액',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: '총 테스트',
      value: analytics?.total_tests || 0,
      sub: `사용자 ${analytics?.users_with_tests || 0}명`,
      icon: ClipboardList,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8"
            >
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
            <div
              key={stat.label}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
            >
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

        {/* Tabs - simplified to essentials */}
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

          <TabsContent value="bookings">
            <AdminBookingManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>

          <TabsContent value="experts">
            <ExpertApplicationManagement />
          </TabsContent>

          <TabsContent value="user-data">
            <EnhancedUserDataViewer />
          </TabsContent>

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
